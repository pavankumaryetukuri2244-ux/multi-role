package com.example.multi._role.service;

import com.example.multi._role.entity.Product;
import java.util.List;

public interface ProductService {
    List<Product> getProductsByTenant(String email);
    Product createProduct(Product product, String adminEmail);
    Product updateProduct(Long id, Product productDetails, String adminEmail);
    void deleteProduct(Long id, String adminEmail);
}
