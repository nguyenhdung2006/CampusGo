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

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository,
                                   StoreRepository storeRepository,
                                   ProductRepository productRepository) {
        return args -> {
            seedUsers(userRepository);

            List<Store> stores = seedStoresIfEmpty(storeRepository);

            if (productRepository.count() == 0 && !stores.isEmpty()) {
                seedProducts(productRepository, stores);
            }
        };
    }

    private void seedUsers(UserRepository userRepository) {
        if (userRepository.count() > 0) return;

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

    private List<Store> seedStoresIfEmpty(StoreRepository storeRepository) {
        if (storeRepository.count() > 0) {
            return storeRepository.findAll();
        }

        List<Store> stores = new ArrayList<>();

        // ===== rice =====
        stores.add(buildStore("Cơm Nhà Làm", "rice", "Cơm phần chuẩn vị gia đình, phục vụ nhanh cho sinh viên giờ cao điểm.",
                "Số 12, ngõ KTX A, khuôn viên Campus", "./assets/images/com-nha-lam.jpg", 4.5, 10, 0));
        stores.add(buildStore("Bếp Sinh Viên", "rice", "Quán cơm giá mềm, combo tiết kiệm cho bữa trưa và bữa tối.",
                "Tầng 1 nhà ăn B, cạnh thư viện", "./assets/images/bep-sinh-vien.jpg", 0.0, 0, 0));
        stores.add(buildStore("Cơm Tấm Cổng Tây", "rice", "Cơm tấm sườn bì chả phong cách Sài Gòn.",
                "Cổng Tây khu dịch vụ", "./assets/images/com-cong-tay.jpg", 4.1, 7, 0));
        stores.add(buildStore("Cơm Gà Campus", "rice", "Cơm gà luộc, gà chiên cho bữa trưa nhanh.",
                "Khu ẩm thực A", "./assets/images/com-ga-campus.jpg", 4.3, 12, 0));
        stores.add(buildStore("Cơm Văn Phòng Mini", "rice", "Set cơm gọn nhẹ, đủ dinh dưỡng.",
                "Đường nội bộ số 2", "./assets/images/com-van-phong.webp", 4.0, 5, 0));

        // ===== noodle =====
        stores.add(buildStore("Mỳ 1988", "noodle", "Chuyên các món mỳ cay, mỳ nước và topping đậm vị kiểu Hàn.",
                "Đường nội bộ số 3, đối diện sân bóng", "./assets/images/my-1988.jpg", 4.2, 8, 0));
        stores.add(buildStore("Noodle Corner", "noodle", "Mỳ trộn, mỳ nước và các món ăn nhanh cho buổi tối học nhóm.",
                "Khu dịch vụ C, gần cổng phụ", "./assets/images/noodle-corner.jpg", 0.0, 0, 0));
        stores.add(buildStore("Mỳ Cay 7 Cấp", "noodle", "Mỳ cay nhiều cấp độ cho team ăn cay.",
                "Phố ẩm thực sinh viên", "./assets/images/my-cay-7-cap.png", 4.4, 20, 0));
        stores.add(buildStore("Mỳ Trộn Đêm", "noodle", "Mỳ trộn khô đậm vị, mở cửa tối muộn.",
                "Khu KTX B", "./assets/images/my-trong-dem.jpg", 4.1, 9, 0));
        stores.add(buildStore("Udon House", "noodle", "Mỳ udon nước dùng thanh nh���.",
                "Nhà ăn C", "./assets/images/udon.jpg", 4.0, 6, 0));

        // ===== pizza =====
        stores.add(buildStore("Pizza Campus", "pizza", "Pizza đế mỏng, nhiều phô mai, phù hợp ăn nhóm trong ký túc xá.",
                "Ki-ốt 05, phố ẩm thực sinh viên", "./assets/images/pizza-campus.jpg", 4.8, 15, 0));
        stores.add(buildStore("Lò Nướng Đêm", "pizza", "Mở tối muộn, chuyên pizza và đồ nướng cho ca học đêm.",
                "Góc nhà E, cạnh bãi xe số 2", "./assets/images/lo-nuong-dem.jpg", 0.0, 0, 0));
        stores.add(buildStore("Cheese Town", "pizza", "Đậm vị phô mai, topping phong phú.",
                "Đối diện thư viện", "./assets/images/cheese.webp", 4.5, 14, 0));
        stores.add(buildStore("Pizza Slice", "pizza", "Pizza lát tiện cho ăn nhanh.",
                "Cổng phụ phía Đông", "./assets/images/slice-pizza.jpg", 4.2, 8, 0));
        stores.add(buildStore("Pizza Nhanh", "pizza", "Nướng nhanh, giao nhanh trong campus.",
                "Khu dịch vụ B", "./assets/images/fastpizza.jpg", 4.0, 4, 0));

        // ===== banh-mi =====
        stores.add(buildStore("Bánh Mì Cổng Trường", "banh-mi", "Bánh mì nóng giòn, nhân đầy đặn.",
                "Cổng chính", "./assets/images/banh-mi-school.jpg", 4.6, 30, 0));
        stores.add(buildStore("Bánh Mì Sáng", "banh-mi", "Phục vụ sáng sớm cho sinh viên.",
                "Khu ký túc xá A", "./assets/images/banh-mi-sang.jpg", 4.1, 11, 0));
        stores.add(buildStore("Bánh Mì Cô Ba", "banh-mi", "Pate nhà làm, sốt bơ đặc trưng.",
                "Nhà ăn B", "./assets/images/banhmicoba.jpg", 4.3, 9, 0));
        stores.add(buildStore("Bánh Mì 24/7", "banh-mi", "Mở cửa linh hoạt cả ngày.",
                "Gần bãi xe số 1", "./assets/images/banhmi24-7.jpg", 4.0, 5, 0));
        stores.add(buildStore("Bánh Mì Bếp Nhỏ", "banh-mi", "Bánh mì handmade, vị truyền thống.",
                "Khu dịch vụ C", "./assets/images/banh-mi-bep-nho.png", 4.2, 7, 0));

        // ===== ga-ran =====
        stores.add(buildStore("Gà Rán Giòn", "ga-ran", "Gà giòn rụm, sốt đa dạng.",
                "Phố ẩm thực", "./assets/images/KFC.jpg", 4.4, 16, 0));
        stores.add(buildStore("Gà Sốt Cay", "ga-ran", "Gà sốt cay kiểu Hàn.",
                "Khu dịch vụ A", "./assets/images/Untitled-900x604-1.jpg", 4.1, 10, 0));
        stores.add(buildStore("Gà Rán Sinh Viên", "ga-ran", "Giá mềm, combo nhóm.",
                "Cổng ký túc xá B", "./assets/images/ga-ran-sv.jpg", 4.0, 8, 0));
        stores.add(buildStore("Chicken Box", "ga-ran", "Hộp gà tiện lợi mang đi.",
                "Nhà ăn D", "./assets/images/chicken-box.png", 4.3, 12, 0));
        stores.add(buildStore("Gà Rán Đêm", "ga-ran", "Mở tới khuya cho ca học đêm.",
                "Gần sân bóng", "./assets/images/quan-ga-ran-kfc-gan-day-2.jpg", 4.2, 6, 0));

        // ===== bun-pho-mien =====
        stores.add(buildStore("Bún Bò Sáng", "bun-pho-mien", "Nước dùng đậm đà, topping đầy đủ.",
                "Cạnh thư viện", "./assets/images/bun_bo_ham_cho_bua_sang_19eb2ff3fbea46b7ae44fad89a93baea.jpg", 4.5, 18, 0));
        stores.add(buildStore("Phở Campus", "bun-pho-mien", "Phở bò/phở gà chuẩn vị.",
                "Khu nhà ăn A", "./assets/images/unipho.jpg", 4.1, 10, 0));
        stores.add(buildStore("Miến Gà Nhà", "bun-pho-mien", "Miến gà ta thơm nhẹ.",
                "Cổng phụ", "./assets/images/mienganha.jpg", 4.0, 7, 0));
        stores.add(buildStore("Bún Riêu Góc Chợ", "bun-pho-mien", "Bún riêu cua kiểu Bắc.",
                "Khu dịch vụ E", "./assets/images/hqdefault.jpg", 4.3, 9, 0));
        stores.add(buildStore("Phở Bò 24h", "bun-pho-mien", "Phở bò mở từ sáng đến khuya.",
                "Đường nội bộ số 1", "./assets/images/pho24.png", 4.2, 13, 0));

        // ===== com-xoi =====
        stores.add(buildStore("Xôi Cô Lan", "com-xoi", "Xôi mặn truyền thống, topping đa dạng.",
                "Cổng ký túc xá A", "./assets/images/maxresdefault.jpg", 4.4, 14, 0));
        stores.add(buildStore("Cơm Xôi 2in1", "com-xoi", "Kết hợp cơm và xôi cho bữa no lâu.",
                "Khu nhà ăn C", "./assets/images/476312708_1132940675123349_3186001733938464714_n.jpg", 4.1, 8, 0));
        stores.add(buildStore("Xôi Mặn Đêm", "com-xoi", "Mở tối muộn, tiện mang đi.",
                "Gần bãi xe số 3", "./assets/images/xoi-dem.jpg", 4.0, 6, 0));
        stores.add(buildStore("Cơm Xối Mỡ", "com-xoi", "Cơm/xôi kèm gà xối mỡ.",
                "Phố ẩm thực", "./assets/images/vn-11134513-7ra0g-m8zqhn5pae7i5b@resize_ss1242x600!@crop_w1242_h600_cT.jpg", 4.2, 9, 0));
        stores.add(buildStore("Xôi Gà Góc Nhỏ", "com-xoi", "Xôi gà xé, sốt đặc biệt.",
                "Khu dịch vụ B", "./assets/images/cach-nau-xoi-ga-mo-hanh.jpg", 4.3, 11, 0));

        return storeRepository.saveAll(stores);
    }

    private Store buildStore(String name,
                             String categoryId,
                             String description,
                             String address,
                             String image,
                             double rating,
                             int ratingCount,
                             int purchaseCount) {
        Store s = new Store();
        s.setName(name);
        s.setCategoryId(categoryId);
        s.setDescription(description);
        s.setAddress(address);
        s.setPhone("0901" + ThreadLocalRandom.current().nextInt(100000, 999999));
        s.setImage(image);

        s.setRating(rating);
        s.setRatingCount(ratingCount);
        s.setTotalRatingPoints((int) Math.round(rating * ratingCount));
        s.setPurchaseCount(purchaseCount);
        return s;
    }

    private void seedProducts(ProductRepository productRepository, List<Store> stores) {
        Map<String, List<String>> pools = productPoolsByCategory();

        List<Product> allProducts = new ArrayList<>();

        for (Store store : stores) {
            List<String> pool = pools.getOrDefault(store.getCategoryId(), defaultPool());
            List<String> picked = pickRandomDistinct(pool, 5);

            for (String baseName : picked) {
                Product p = new Product();
                p.setStore(store);
                p.setName(baseName);
                p.setPrice((double) priceByCategory(store.getCategoryId()));
                p.setDescription("Món đặc trưng tại " + store.getName());
                p.setImage(store.getImage());
                allProducts.add(p);
            }
        }

        productRepository.saveAll(allProducts);
    }

    private Map<String, List<String>> productPoolsByCategory() {
        Map<String, List<String>> map = new HashMap<>();

        map.put("rice", Arrays.asList(
                "Cơm gà xối mỡ", "Cơm sườn nướng", "Cơm bò lúc lắc", "Cơm cá kho", "Cơm trứng chiên",
                "Cơm thịt kho", "Cơm gà nướng", "Cơm rang dương châu", "Cơm bò tiêu đen", "Cơm tấm đặc biệt"
        ));
        map.put("noodle", Arrays.asList(
                "Mỳ bò cay", "Mỳ hải sản", "Mỳ trộn thịt bằm", "Mỳ gà nấm", "Mỳ xào bò",
                "Mỳ ramen", "Mỳ udon bò", "Mỳ nước xương hầm", "Mỳ trộn cay", "Mỳ ý sốt kem"
        ));
        map.put("pizza", Arrays.asList(
                "Pizza xúc xích", "Pizza phô mai", "Pizza bò bằm", "Pizza hải sản", "Pizza gà sốt cay",
                "Pizza pepperoni", "Pizza nấm", "Pizza BBQ", "Pizza 4 phô mai", "Pizza bò nướng"
        ));
        map.put("banh-mi", Arrays.asList(
                "Bánh mì trứng", "Bánh mì thịt nướng", "Bánh mì chả cá", "Bánh mì pate", "Bánh mì gà xé",
                "Bánh mì xíu mại", "Bánh mì xúc xích", "Bánh mì heo quay", "Bánh mì chà bông", "Bánh mì bò sốt"
        ));
        map.put("ga-ran", Arrays.asList(
                "Gà rán 2 miếng", "Gà sốt cay", "Combo gà + khoai", "Gà không xương", "Burger gà",
                "Đùi gà giòn", "Cánh gà chiên", "Gà sốt mật ong", "Gà popcorn", "Combo gia đình"
        ));
        map.put("bun-pho-mien", Arrays.asList(
                "Bún bò", "Phở bò", "Miến gà", "Bún riêu", "Phở gà",
                "Bún chả", "Miến trộn", "Phở tái nạm", "Bún mọc", "Miến hải sản"
        ));
        map.put("com-xoi", Arrays.asList(
                "Xôi gà", "Cơm xôi đặc biệt", "Xôi xéo", "Xôi thịt kho", "Cơm gà xé",
                "Xôi lạp xưởng", "Xôi chả", "Xôi pate", "Cơm tấm sườn", "Xôi đùi gà"
        ));

        return map;
    }

    private List<String> defaultPool() {
        return Arrays.asList("Món đặc biệt 1", "Món đặc biệt 2", "Món đặc biệt 3", "Món đặc biệt 4", "Món đặc biệt 5");
    }

    private List<String> pickRandomDistinct(List<String> source, int n) {
        List<String> copy = new ArrayList<>(source);
        Collections.shuffle(copy);
        return copy.subList(0, Math.min(n, copy.size()));
    }

    private int priceByCategory(String categoryId) {
        return switch (categoryId) {
            case "pizza" -> rand(89000, 149000);
            case "ga-ran" -> rand(39000, 99000);
            case "banh-mi" -> rand(18000, 42000);
            case "bun-pho-mien" -> rand(30000, 65000);
            case "com-xoi" -> rand(25000, 55000);
            default -> rand(28000, 65000); // rice, noodle
        };
    }

    private int rand(int min, int max) {
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }
}