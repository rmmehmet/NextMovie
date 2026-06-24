package com.nextmovie.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String username;
    private String name;

    public AuthResponse(String token, String email, String username, String name) {
        this.token = token;
        this.email = email;
        this.username = username;
        this.name = name;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getName() { return name; }
}