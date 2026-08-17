package com.nextmovie.controller;

import com.nextmovie.entity.User;
import com.nextmovie.repository.UserRepository;
import com.nextmovie.security.TokenExtractor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private static final String UPLOAD_DIR = "uploads/profile-pictures/";
    private final UserRepository userRepository;
    private final TokenExtractor tokenExtractor;

    public ProfileController(UserRepository userRepository, TokenExtractor tokenExtractor) {
        this.userRepository = userRepository;
        this.tokenExtractor = tokenExtractor;
        try { Files.createDirectories(Paths.get(UPLOAD_DIR)); } catch (IOException ignored) {}
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(
            @RequestHeader("Authorization") String authHeader) {
        User user = tokenExtractor.extractUser(authHeader);
        return ResponseEntity.ok(Map.of(
                "id",             user.getId(),
                "name",           user.getName() != null ? user.getName() : "",
                "lastname",       user.getLastname() != null ? user.getLastname() : "",
                "username",       user.getUsername(),
                "email",          user.getEmail(),
                "profilePicture", user.getProfilePicture() != null ? user.getProfilePicture() : ""
        ));
    }

    @PutMapping
    public ResponseEntity<String> updateProfile(
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User user = tokenExtractor.extractUser(authHeader);
        if (body.containsKey("name"))     user.setName(body.get("name"));
        if (body.containsKey("lastname")) user.setLastname(body.get("lastname"));
        if (body.containsKey("username")) user.setUsername(body.get("username"));
        userRepository.save(user);
        return ResponseEntity.ok("Profil güncellendi.");
    }

    @PostMapping("/picture")
    public ResponseEntity<Map<String, String>> uploadPicture(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) throws IOException {
        User user = tokenExtractor.extractUser(authHeader);
        String ext      = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path   path     = Paths.get(UPLOAD_DIR + filename);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        String url = "/api/profile/picture/" + filename;
        user.setProfilePicture(url);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/picture/{filename}")
    public ResponseEntity<byte[]> servePicture(@PathVariable String filename) throws IOException {
        Path path = Paths.get(UPLOAD_DIR + filename);
        byte[] bytes = Files.readAllBytes(path);
        String contentType = filename.endsWith(".png") ? "image/png" : "image/jpeg";
        return ResponseEntity.ok().header("Content-Type", contentType).body(bytes);
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}