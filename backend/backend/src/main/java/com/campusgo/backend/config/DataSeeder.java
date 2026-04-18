package com.campusgo.backend.config;

import com.campusgo.backend.entity.Product;
import com.campusgo.backend.entity.Store;
import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.ProductRepository;
import com.campusgo.backend.repository.StoreRepository;
import com.campusgo.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository,
                                   StoreRepository storeRepository,
                                   ProductRepository productRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User student = new User();
                student.setName("Nguyen Van A");
                student.setEmail("student@campusgo.vn");
                student.setPassword("123456");
                student.setRole("USER");
                student.setPhone("0901000001");
                userRepository.save(student);

                User shipper = new User();
                shipper.setName("Tran Thi B");
                shipper.setEmail("shipper@campusgo.vn");
                shipper.setPassword("123456");
                shipper.setRole("SHIPPER");
                shipper.setPhone("0901000002");
                userRepository.save(shipper);
            }

            if (storeRepository.count() == 0) {
                Store store1 = new Store();
                store1.setName("Canteen A");
                store1.setAddress("Khu A - Truong Dai hoc");
                store1.setPhone("02873001111");
                storeRepository.save(store1);

                Store store2 = new Store();
                store2.setName("Tra Sua Campus");
                store2.setAddress("Khu B - Truong Dai hoc");
                store2.setPhone("02873002222");
                storeRepository.save(store2);

                Product p1 = new Product();
                p1.setName("Com ga");
                p1.setPrice(30000.0);
                p1.setImage("https://example.com/com-ga.jpg");
                p1.setDescription("Com ga xoi mo");
                p1.setStore(store1);
                productRepository.save(p1);

                Product p2 = new Product();
                p2.setName("Bun bo");
                p2.setPrice(35000.0);
                p2.setImage("https://example.com/bun-bo.jpg");
                p2.setDescription("Bun bo Hue");
                p2.setStore(store1);
                productRepository.save(p2);

                Product p3 = new Product();
                p3.setName("Tra sua tran chau");
                p3.setPrice(25000.0);
                p3.setImage("https://example.com/tra-sua.jpg");
                p3.setDescription("Tra sua size M");
                p3.setStore(store2);
                productRepository.save(p3);
            }
        };
    }
}