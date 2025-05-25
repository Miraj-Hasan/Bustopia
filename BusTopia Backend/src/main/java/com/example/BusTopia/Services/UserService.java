package com.example.BusTopia.Services;


import com.example.BusTopia.AwsConfiguration.AwsFileUpload;
import com.example.BusTopia.DTOs.Register.RegisterRequest;
import com.example.BusTopia.DTOs.UpdateProfile.UpdateProfileDTO;
import com.example.BusTopia.DatabaseEntity.UserEntity;
import com.example.BusTopia.MySqlRepositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AwsFileUpload awsFileUpload;

    public UserEntity register(RegisterRequest registerRequest, MultipartFile imageFile) throws Exception{
        UserEntity userEntity = convertRegisterRequestToUser(registerRequest);
        if( imageFile != null && !imageFile.isEmpty() ){
            String imageUrl = awsFileUpload.uploadFile(imageFile);
            userEntity.setImageUrl(imageUrl);
        }
        userEntity = userRepository.save(userEntity);
        return userEntity;
    }

    public UserEntity updateUserProfile(String email, UpdateProfileDTO update, MultipartFile imageFile) throws Exception {

        UserEntity user = userRepository.findByEmail(email);

        user.setName(update.getUsername());
        user.setPhone(update.getPhone());
        user.setGender(update.getGender());

        if (imageFile != null && !imageFile.isEmpty()) {

            String previousImageUrl = user.getImageUrl();
            if (previousImageUrl != null && !previousImageUrl.isEmpty()) {
                awsFileUpload.deleteFile(previousImageUrl);
            }

            String newImageUrl = awsFileUpload.uploadFile(imageFile);
            user.setImageUrl(newImageUrl);
        }
        return userRepository.save(user);
    }

    private UserEntity convertRegisterRequestToUser(RegisterRequest registerRequest) {
        return UserEntity.builder()
                .userName(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .gender(registerRequest.getGender())
                .role("ROLE_USER")
                .build();
    }
}
