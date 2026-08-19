package com.nextmovie.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class PythonServiceLauncher {

    private static final Logger log = LoggerFactory.getLogger(PythonServiceLauncher.class);

    @Value("${python.service.enabled:true}")
    private boolean enabled;

    @Value("${python.service.path:../recommendation-service}")
    private String servicePath;

    @Value("${python.service.command:python}")
    private String pythonCommand;

    private Process process;

    @EventListener(ApplicationReadyEvent.class)
    public void startPythonService() {
        if (!enabled) {
            log.info("Python servisi devre dışı (python.service.enabled=false).");
            return;
        }

        try {
            File dir = new File(servicePath);
            if (!dir.exists()) {
                log.warn("Python servis klasörü bulunamadı: {}. Servis başlatılmadı.", dir.getAbsolutePath());
                return;
            }

            ProcessBuilder pb = new ProcessBuilder(pythonCommand, "main.py");
            pb.directory(dir);
            pb.redirectErrorStream(true);
            pb.inheritIO();
            process = pb.start();
            log.info("Python recommendation servisi başlatıldı (PID: {}, path: {})",
                    process.pid(), dir.getAbsolutePath());
        } catch (Exception e) {
            log.warn("Python servisi başlatılamadı: {}. Recommendation özellikleri devre dışı olacak.", e.getMessage());
        }
    }

    @jakarta.annotation.PreDestroy
    public void stopPythonService() {
        if (process != null && process.isAlive()) {
            process.destroy();
            log.info("Python recommendation servisi durduruldu.");
        }
    }
}