package com.example.multi._role.serviceimpl;

import com.example.multi._role.entity.Product;
import com.example.multi._role.entity.Tenant;
import com.example.multi._role.entity.User;
import com.example.multi._role.repository.ProductRepository;
import com.example.multi._role.repository.UserRepository;
import com.example.multi._role.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Product> getProductsByTenant(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Tenant tenant = user.getTenant();
        if (tenant == null) {
            return Collections.emptyList();
        }
        return productRepository.findByTenant(tenant);
    }

    @Override
    @Transactional
    public Product createProduct(Product product, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }
        product.setTenant(tenant);
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, Product productDetails, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized: Product does not belong to your tenant");
        }
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Tenant tenant = admin.getTenant();
        if (tenant == null) {
            throw new RuntimeException("Admin is not associated with any tenant");
        }
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized: Product does not belong to your tenant");
        }
        
        productRepository.delete(product);
    }
}
