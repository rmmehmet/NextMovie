package com.nextmovie.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class PythonServiceLauncher {

    private static final Logger log = LoggerFactory.getLogger(PythonServiceLauncher.class);
    private Process process;

    @EventListener(ApplicationReadyEvent.class)
    public void startPythonService() {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "python", "main.py"
            );
            // recommendation-service klasörünün yolu
            pb.directory(new File("../../../../recommendation-service"));
            pb.redirectErrorStream(true);
            pb.inheritIO(); // Python logları Spring konsoluna yansır
            process = pb.start();
            log.info("Python recommendation servisi başlatıldı (PID: {})", process.pid());
        } catch (Exception e) {
            log.warn("Python servisi başlatılamadı: {}", e.getMessage());
        }
    }

    // Spring kapanınca Python'u da kapat
    @jakarta.annotation.PreDestroy
    public void stopPythonService() {
        if (process != null && process.isAlive()) {
            process.destroy();
            log.info("Python recommendation servisi durduruldu.");
        }
    }
}