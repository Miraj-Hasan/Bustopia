package com.example.BusTopia.MySqlRepositories;

import com.example.BusTopia.DatabaseEntity.PasswordResetEntity;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PassResetRepository extends JpaRepository<PasswordResetEntity,Long> {
    PasswordResetEntity findByUser(UserEntity user);

    PasswordResetEntity findByResetToken(String resetToken);
}
