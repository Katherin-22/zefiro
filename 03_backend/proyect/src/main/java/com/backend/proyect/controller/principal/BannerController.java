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
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = {"http://35.171.131.177:3000", "http://35.171.131.177:8080"})
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

    // 🔹 Eliminar banner por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            Optional<Banner> bannerOptional = bannerRepository.findById(id);

            if (!bannerOptional.isPresent()) {
                System.out.println("❌ Banner no encontrado - ID: " + id);
                return ResponseEntity.notFound().build();
            }

            Banner banner = bannerOptional.get();
            String fileName = banner.getFileName();

            // Eliminar archivo físico si existe
            if (fileName != null && !fileName.isEmpty()) {
                Path filePath = Paths.get(uploadPath, fileName);
                Files.deleteIfExists(filePath);
                System.out.println("🗑️ Archivo eliminado: " + fileName);
            }

            // Eliminar registro de la base de datos
            bannerRepository.deleteById(id);
            System.out.println("✅ Banner eliminado - ID: " + id);

            return ResponseEntity.ok().build();

        } catch (IOException e) {
            System.out.println("❌ Error al eliminar archivo físico: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al eliminar archivo físico");
        } catch (Exception e) {
            System.out.println("❌ Error al eliminar banner: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Error al eliminar banner");
        }
    }

    // 🔹 Endpoint para probar
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ API Banners funcionando");
    }
}