package com.example.zefiro;

import android.Manifest;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.SslErrorHandler;
import android.webkit.URLUtil;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.widget.Toast;
import android.view.View;
import android.view.WindowManager;
import android.widget.ProgressBar;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "Zefiro";
    private WebView webView;
    private ProgressBar progressBar;
    private String url = "http://35.171.131.177:3000";

    private static final int PERMISSION_REQUEST_CODE = 100;
    private static final int FILE_CHOOSER_REQUEST_CODE = 101;
    private static final String CHANNEL_ID = "download_channel";

    private DownloadManager downloadManager;
    private ExecutorService executorService = Executors.newSingleThreadExecutor();
    private Handler mainHandler = new Handler(Looper.getMainLooper());

    // Para el selector de archivos
    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraImageUri;

    // Para el receiver de descargas
    private BroadcastReceiver downloadReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "onCreate iniciado");

        try {
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
            if (getSupportActionBar() != null) {
                getSupportActionBar().hide();
            }

            setContentView(R.layout.activity_main);

            webView = findViewById(R.id.webview);
            progressBar = findViewById(R.id.progressBar);

            downloadManager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);

            // Agregar interfaz JavaScript para capturar blobs
            webView.addJavascriptInterface(new WebAppInterface(), "Android");

            checkAndRequestPermissions();
            configureWebView();
            webView.loadUrl(url);

            createNotificationChannel();
            Log.d(TAG, "onCreate completado");
        } catch (Exception e) {
            Log.e(TAG, "Error en onCreate: ", e);
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private class WebAppInterface {
        @android.webkit.JavascriptInterface
        public void downloadPDF(String base64Data, String filename) {
            Log.d(TAG, "downloadPDF llamado: " + filename);
            saveBase64AsPdf(base64Data, filename);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    CHANNEL_ID,
                    "Descargas",
                    android.app.NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Notificaciones de descargas");

            android.app.NotificationManager notificationManager = getSystemService(android.app.NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void configureWebView() {
        try {
            Log.d(TAG, "configureWebView iniciado");
            WebSettings webSettings = webView.getSettings();

            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            webSettings.setLoadWithOverviewMode(true);
            webSettings.setUseWideViewPort(true);
            webSettings.setBuiltInZoomControls(true);
            webSettings.setDisplayZoomControls(false);
            webSettings.setSupportZoom(true);
            webSettings.setDatabaseEnabled(true);
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    view.loadUrl(url);
                    return true;
                }

                @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    view.loadUrl(request.getUrl().toString());
                    return true;
                }

                @Override
                public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                    handler.proceed();
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    progressBar.setVisibility(View.GONE);
                    injectBlobCaptureScript();
                }
            });

            // WebChromeClient para manejar el selector de archivos
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onProgressChanged(WebView view, int newProgress) {
                    if (newProgress < 100) {
                        progressBar.setVisibility(View.VISIBLE);
                        progressBar.setProgress(newProgress);
                    } else {
                        progressBar.setVisibility(View.GONE);
                    }
                }

                // Para Android 5.0+
                @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                    Log.d(TAG, "onShowFileChooser llamado");
                    if (MainActivity.this.filePathCallback != null) {
                        MainActivity.this.filePathCallback.onReceiveValue(null);
                    }
                    MainActivity.this.filePathCallback = filePathCallback;

                    Intent intent;
                    if (fileChooserParams != null) {
                        intent = fileChooserParams.createIntent();
                    } else {
                        intent = new Intent(Intent.ACTION_GET_CONTENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType("*/*");
                    }

                    // Para imágenes, permitir tomar foto
                    String[] acceptTypes = fileChooserParams != null ? fileChooserParams.getAcceptTypes() : new String[]{"*/*"};
                    boolean acceptImages = false;
                    for (String type : acceptTypes) {
                        if (type.startsWith("image/") || type.equals("*/*")) {
                            acceptImages = true;
                            break;
                        }
                    }

                    if (acceptImages && ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        try {
                            File photoFile = createImageFile();
                            if (photoFile != null) {
                                cameraImageUri = FileProvider.getUriForFile(MainActivity.this,
                                        "com.example.zefiro.fileprovider", photoFile);

                                Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                                cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri);

                                Intent chooserIntent = Intent.createChooser(intent, "Seleccionar imagen");
                                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});

                                startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                                return true;
                            }
                        } catch (IOException e) {
                            Log.e(TAG, "Error creando archivo para cámara", e);
                        }
                    }

                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                    return true;
                }

                // Para Android 4.4
                public void openFileChooser(ValueCallback<Uri> uploadMsg) {
                    openFileChooser(uploadMsg, "*/*");
                }

                public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
                    openFileChooser(uploadMsg, acceptType, null);
                }

                public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture) {
                    filePathCallback = new ValueCallback<Uri[]>() {
                        @Override
                        public void onReceiveValue(Uri[] uris) {
                            if (uris != null && uris.length > 0) {
                                uploadMsg.onReceiveValue(uris[0]);
                            } else {
                                uploadMsg.onReceiveValue(null);
                            }
                        }
                    };

                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType(acceptType != null ? acceptType : "*/*");

                    startActivityForResult(Intent.createChooser(intent, "Seleccionar archivo"), FILE_CHOOSER_REQUEST_CODE);
                }
            });

            // DownloadListener para capturar descargas
            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                            String mimetype, long contentLength) {
                    Log.d(TAG, "onDownloadStart llamado: url=" + url);

                    if (url.startsWith("blob:")) {
                        Toast.makeText(MainActivity.this,
                                "📥 Capturando PDF...", Toast.LENGTH_SHORT).show();

                        // Intentar capturar el blob
                        webView.evaluateJavascript(
                                "try { " +
                                        "  var xhr = new XMLHttpRequest();" +
                                        "  xhr.open('GET', '" + url + "', true);" +
                                        "  xhr.responseType = 'blob';" +
                                        "  xhr.onload = function(e) {" +
                                        "    if (this.status == 200) {" +
                                        "      var blob = this.response;" +
                                        "      var reader = new FileReader();" +
                                        "      reader.onload = function() {" +
                                        "        var arrayBuffer = reader.result;" +
                                        "        var byteArray = new Uint8Array(arrayBuffer);" +
                                        "        var binary = '';" +
                                        "        for (var i = 0; i < byteArray.byteLength; i++) {" +
                                        "          binary += String.fromCharCode(byteArray[i]);" +
                                        "        }" +
                                        "        var base64 = btoa(binary);" +
                                        "        Android.downloadPDF(base64, 'pedido_" + System.currentTimeMillis() + ".pdf');" +
                                        "      };" +
                                        "      reader.readAsArrayBuffer(blob);" +
                                        "    }" +
                                        "  };" +
                                        "  xhr.send();" +
                                        "} catch(e) { console.log(e); }", null);

                    } else if (checkStoragePermissions()) {
                        startDownload(url, userAgent, contentDisposition, mimetype);
                    } else {
                        pendingDownloadUrl = url;
                        pendingUserAgent = userAgent;
                        pendingContentDisposition = contentDisposition;
                        pendingMimetype = mimetype;
                        requestStoragePermissionForDownload(url, userAgent, contentDisposition, mimetype);
                    }
                }
            });
            Log.d(TAG, "configureWebView completado");
        } catch (Exception e) {
            Log.e(TAG, "Error en configureWebView: ", e);
        }
    }

    private void injectBlobCaptureScript() {
        String script =
                "if (typeof window.originalFetch === 'undefined') {" +
                        "  window.originalFetch = window.fetch;" +
                        "  window.fetch = function() {" +
                        "    return originalFetch.apply(this, arguments).then(function(response) {" +
                        "      if (response.url && response.url.includes('blob')) {" +
                        "        response.clone().blob().then(function(blob) {" +
                        "          if (blob.type.includes('pdf')) {" +
                        "            var reader = new FileReader();" +
                        "            reader.onload = function() {" +
                        "              var arrayBuffer = reader.result;" +
                        "              var byteArray = new Uint8Array(arrayBuffer);" +
                        "              var binary = '';" +
                        "              for (var i = 0; i < byteArray.byteLength; i++) {" +
                        "                binary += String.fromCharCode(byteArray[i]);" +
                        "              }" +
                        "              var base64 = btoa(binary);" +
                        "              Android.downloadPDF(base64, 'documento_' + Date.now() + '.pdf');" +
                        "            };" +
                        "            reader.readAsArrayBuffer(blob);" +
                        "          }" +
                        "        });" +
                        "      }" +
                        "      return response;" +
                        "    });" +
                        "  };" +
                        "}";

        webView.evaluateJavascript(script, null);
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    // Método para convertir URI content:// a archivo temporal
    private Uri copyUriToTempFile(Uri uri) {
        try {
            ContentResolver resolver = getContentResolver();
            String fileName = getFileNameFromUri(uri);
            if (fileName == null) {
                fileName = "temp_image_" + System.currentTimeMillis() + ".jpg";
            }

            File tempFile = new File(getCacheDir(), fileName);

            try (InputStream inputStream = resolver.openInputStream(uri);
                 OutputStream outputStream = new FileOutputStream(tempFile)) {

                byte[] buffer = new byte[8192];
                int length;
                while ((length = inputStream.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, length);
                }
            }

            // Obtener URI del archivo temporal con FileProvider
            return FileProvider.getUriForFile(this, "com.example.zefiro.fileprovider", tempFile);

        } catch (Exception e) {
            Log.e(TAG, "Error copiando archivo: ", e);
            return null;
        }
    }

    private String getFileNameFromUri(Uri uri) {
        String fileName = null;
        if (uri.getScheme().equals("content")) {
            try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (nameIndex != -1) {
                        fileName = cursor.getString(nameIndex);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error obteniendo nombre de archivo", e);
            }
        }
        if (fileName == null) {
            fileName = uri.getLastPathSegment();
        }
        return fileName;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Log.d(TAG, "onActivityResult: requestCode=" + requestCode + ", resultCode=" + resultCode);

        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return;

            Uri[] results = null;

            if (resultCode == RESULT_OK) {
                if (data != null) {
                    String dataString = data.getDataString();
                    ClipData clipData = data.getClipData();

                    if (clipData != null) {
                        results = new Uri[clipData.getItemCount()];
                        for (int i = 0; i < clipData.getItemCount(); i++) {
                            ClipData.Item item = clipData.getItemAt(i);
                            Uri originalUri = item.getUri();
                            Log.d(TAG, "ClipData URI original: " + originalUri.toString());

                            // Si es URI de galería (content://), convertir a archivo temporal
                            if (originalUri != null && "content".equals(originalUri.getScheme())) {
                                Uri tempUri = copyUriToTempFile(originalUri);
                                if (tempUri != null) {
                                    results[i] = tempUri;
                                    Log.d(TAG, "URI convertida a: " + tempUri.toString());
                                } else {
                                    results[i] = originalUri;
                                }
                            } else {
                                results[i] = originalUri;
                            }
                        }
                    } else if (dataString != null) {
                        Uri originalUri = Uri.parse(dataString);
                        Log.d(TAG, "DataString URI original: " + originalUri.toString());

                        // Si es URI de galería (content://), convertir a archivo temporal
                        if ("content".equals(originalUri.getScheme())) {
                            Uri tempUri = copyUriToTempFile(originalUri);
                            if (tempUri != null) {
                                results = new Uri[]{tempUri};
                                Log.d(TAG, "URI convertida a: " + tempUri.toString());
                            } else {
                                results = new Uri[]{originalUri};
                            }
                        } else {
                            results = new Uri[]{originalUri};
                        }
                    }
                } else if (cameraImageUri != null) {
                    results = new Uri[]{cameraImageUri};
                    Log.d(TAG, "Camera URI: " + cameraImageUri.toString());

                    // Notificar a la galería
                    Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
                    mediaScanIntent.setData(cameraImageUri);
                    sendBroadcast(mediaScanIntent);
                }
            }

            // Conceder permisos de lectura temporal
            if (results != null) {
                for (Uri uri : results) {
                    if (uri != null) {
                        try {
                            this.grantUriPermission(
                                    "com.example.zefiro",
                                    uri,
                                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                            );
                            Log.d(TAG, "Permiso concedido para URI: " + uri.toString());
                        } catch (Exception e) {
                            Log.e(TAG, "Error concediendo permiso: ", e);
                        }
                    }
                }
            }

            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            cameraImageUri = null;
        }
    }

    private void saveBase64AsPdf(String base64Data, String filename) {
        Log.d(TAG, "saveBase64AsPdf: " + filename);
        executorService.execute(() -> {
            try {
                byte[] pdfData = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs();
                }

                File pdfFile = new File(downloadsDir, filename);

                FileOutputStream fos = new FileOutputStream(pdfFile);
                fos.write(pdfData);
                fos.close();

                mainHandler.post(() -> {
                    showDownloadCompleteNotification(filename, Uri.fromFile(pdfFile));
                    Toast.makeText(this, "✅ PDF guardado en Downloads/" + filename, Toast.LENGTH_LONG).show();
                });

            } catch (Exception e) {
                Log.e(TAG, "Error guardando PDF: ", e);
                mainHandler.post(() -> {
                    Toast.makeText(this, "❌ Error al guardar PDF: " + e.getMessage(), Toast.LENGTH_LONG).show();
                });
                e.printStackTrace();
            }
        });
    }

    private void startDownload(String url, String userAgent, String contentDisposition, String mimetype) {
        Log.d(TAG, "startDownload: " + url);
        try {
            Uri uri = Uri.parse(url);
            DownloadManager.Request request = new DownloadManager.Request(uri);

            String cookies = CookieManager.getInstance().getCookie(url);
            if (cookies != null && !cookies.isEmpty()) {
                request.addRequestHeader("cookie", cookies);
            }
            if (userAgent != null) {
                request.addRequestHeader("User-Agent", userAgent);
            }

            String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
            final String finalFilename = filename;

            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, finalFilename);
            request.setTitle(finalFilename);
            request.setDescription("Descargando...");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

            final long downloadId = downloadManager.enqueue(request);

            if (downloadId != -1) {
                downloadReceiver = new BroadcastReceiver() {
                    @Override
                    public void onReceive(Context context, Intent intent) {
                        long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                        if (id == downloadId) {
                            Uri downloadUri = downloadManager.getUriForDownloadedFile(downloadId);
                            showDownloadCompleteNotification(finalFilename, downloadUri);

                            try {
                                unregisterReceiver(downloadReceiver);
                            } catch (Exception e) {
                                // Ignorar si ya está desregistrado
                            }
                        }
                    }
                };

                IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    registerReceiver(downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
                } else {
                    registerReceiver(downloadReceiver, filter);
                }
            }

        } catch (Exception e) {
            Log.e(TAG, "Error en startDownload: ", e);
            Toast.makeText(this, "❌ Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void showDownloadCompleteNotification(String filename, Uri fileUri) {
        Log.d(TAG, "showDownloadCompleteNotification: " + filename);
        Intent openIntent = new Intent(Intent.ACTION_VIEW);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            File file = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), filename);
            Uri contentUri = FileProvider.getUriForFile(this, "com.example.zefiro.fileprovider", file);
            openIntent.setDataAndType(contentUri, "application/pdf");
            openIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } else {
            openIntent.setDataAndType(fileUri, "application/pdf");
        }

        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        android.app.PendingIntent pendingIntent = android.app.PendingIntent.getActivity(
                this,
                0,
                openIntent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.stat_sys_download_done)
                .setContentTitle("PDF descargado")
                .setContentText(filename)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .addAction(android.R.drawable.ic_menu_view, "Abrir PDF", pendingIntent);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        try {
            notificationManager.notify((int) System.currentTimeMillis(), builder.build());
        } catch (SecurityException e) {
            Toast.makeText(this, "✅ PDF guardado: " + filename, Toast.LENGTH_LONG).show();
        }
    }

    private void checkAndRequestPermissions() {
        Log.d(TAG, "checkAndRequestPermissions");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{
                                Manifest.permission.READ_MEDIA_IMAGES,
                                Manifest.permission.POST_NOTIFICATIONS,
                                Manifest.permission.CAMERA
                        },
                        PERMISSION_REQUEST_CODE);
            }
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{
                                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                                Manifest.permission.READ_EXTERNAL_STORAGE,
                                Manifest.permission.CAMERA
                        },
                        PERMISSION_REQUEST_CODE);
            }
        }
    }

    private boolean checkStoragePermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    == PackageManager.PERMISSION_GRANTED;
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private void requestStoragePermissionForDownload(final String url, final String userAgent,
                                                     final String contentDisposition, final String mimetype) {
        pendingDownloadUrl = url;
        pendingUserAgent = userAgent;
        pendingContentDisposition = contentDisposition;
        pendingMimetype = mimetype;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.READ_MEDIA_IMAGES},
                    PERMISSION_REQUEST_CODE);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    PERMISSION_REQUEST_CODE);
        }
    }

    private String pendingDownloadUrl = null;
    private String pendingUserAgent = null;
    private String pendingContentDisposition = null;
    private String pendingMimetype = null;

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        Log.d(TAG, "onRequestPermissionsResult");

        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingDownloadUrl != null) {
                    if (pendingDownloadUrl.startsWith("blob:")) {
                        Toast.makeText(this, "Reintentando captura de PDF...", Toast.LENGTH_SHORT).show();
                        webView.reload();
                    } else {
                        startDownload(pendingDownloadUrl, pendingUserAgent,
                                pendingContentDisposition, pendingMimetype);
                    }
                    pendingDownloadUrl = null;
                }
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        executorService.shutdown();

        if (downloadReceiver != null) {
            try {
                unregisterReceiver(downloadReceiver);
            } catch (Exception e) {
                // Ignorar
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}