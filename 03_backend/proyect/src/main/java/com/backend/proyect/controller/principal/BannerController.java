package com.backend.proyect.controller.principal;

import com.backend.proyect.model.principal.Banner;
import com.backend.proyect.repository.principal.BannerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class BannerController {

    @Value("${upload.path}")
    private String uploadPath;

    private final BannerRepository bannerRepository;

    public BannerController(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    // 🔹 Subir archivo y registrar banner
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Banner> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Crear carpeta si no existe
        File folder = new File(uploadPath);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        // Generar nombre único con extensión
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID() + extension;
        Path path = Paths.get(uploadPath, fileName);

        // Guardar archivo físicamente
        Files.copy(file.getInputStream(), path);

        // URL para acceder al archivo
        String url = "/uploads/" + fileName;

        // Crear y guardar banner en BD
        Banner banner = new Banner();
        banner.setTitulo("Banner " + fileName.substring(0, 8));
        banner.setDescripcion("Banner promocional");
        banner.setFileName(fileName);
        banner.setUrl(url);
        banner.setActivo(true);

        Banner savedBanner = bannerRepository.save(banner);

        // Debug en consola
        System.out.println("✅ Banner guardado - ID: " + savedBanner.getId());
        System.out.println("📁 Archivo: " + fileName);
        System.out.println("🔗 URL: " + url);

        return ResponseEntity.ok(savedBanner);
    }

    // 🔹 Obtener todos los banners
    @GetMapping
    public ResponseEntity<List<Banner>> getAll() {
        List<Banner> banners = bannerRepository.findAll();
        System.out.println("📊 Banners encontrados: " + banners.size());
        return ResponseEntity.ok(banners);
    }

    // 🔹 Endpoint para probar
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ API Banners funcionando");
    }
}