package com.nextmovie.service;

import com.nextmovie.entity.Friendship;
import com.nextmovie.entity.User;
import com.nextmovie.repository.FriendshipRepository;
import com.nextmovie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository       userRepository;

    public FriendshipService(FriendshipRepository friendshipRepository,
                             UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository       = userRepository;
    }

    @Transactional
    public String sendRequestByUsername(Long requesterId, String addresseeUsername) {
        User addressee = userRepository.findByUsername(addresseeUsername)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: @" + addresseeUsername));

        if (requesterId.equals(addressee.getId()))
            throw new RuntimeException("Kendinize istek gönderemezsiniz.");

        friendshipRepository.findBetween(requesterId, addressee.getId()).ifPresent(f -> {
            throw new RuntimeException("Zaten bir istek mevcut: " + f.getStatus());
        });

        User requester = userRepository.findById(requesterId).orElseThrow();

        Friendship f = new Friendship();
        f.setRequester(requester);
        f.setAddressee(addressee);
        f.setStatus(Friendship.FriendshipStatus.PENDING);
        friendshipRepository.save(f);
        return "İstek gönderildi: @" + addresseeUsername;
    }

    @Transactional
    public String respond(Long friendshipId, Long userId, boolean accept) {
        Friendship f = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("İstek bulunamadı."));

        if (!f.getAddressee().getId().equals(userId))
            throw new RuntimeException("Bu isteği yanıtlama yetkiniz yok.");

        f.setStatus(accept ? Friendship.FriendshipStatus.ACCEPTED : Friendship.FriendshipStatus.BLOCKED);
        friendshipRepository.save(f);
        return accept ? "Arkadaşlık kabul edildi." : "İstek reddedildi.";
    }

    public List<Map<String, Object>> getFriends(Long userId) {
        return friendshipRepository.findAcceptedFriendships(userId).stream()
                .map(f -> {
                    User friend = f.getRequester().getId().equals(userId)
                            ? f.getAddressee() : f.getRequester();
                    return Map.<String, Object>of(
                            "id",           friend.getId(),
                            "username",     friend.getUsername(),
                            "name",         friend.getName() != null ? friend.getName() : "",
                            "profileImage", friend.getProfilePicture() != null ? friend.getProfilePicture() : ""
                    );
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPendingRequests(Long userId) {
        return friendshipRepository.findPendingRequests(userId).stream()
                .map(f -> Map.<String, Object>of(
                        "friendshipId", f.getId(),
                        "requesterId",  f.getRequester().getId(),
                        "username",     f.getRequester().getUsername(),
                        "name",         f.getRequester().getName() != null ? f.getRequester().getName() : ""
                )).collect(Collectors.toList());
    }
}