package com.backend.proyect.config.principal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar acceso a archivos subidos
        String path = "file:" + uploadPath + (uploadPath.endsWith("/") ? "" : "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(path);

        System.out.println("🖼️ Configurando recursos estáticos: " + path);
    }
}