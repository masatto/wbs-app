package com.example.wbsapp;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wbs-items")
@RequiredArgsConstructor
public class WbsItemController {
    private final WbsItemRepository wbsItemRepository;

    @GetMapping
    public List<WbsItem> findAll() {
        return wbsItemRepository.findAll();
    }

    @PostMapping
    public WbsItem create(@RequestBody WbsItem wbsItem) {
        return wbsItemRepository.save(wbsItem);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody WbsItem wbsItem) {
        wbsItem.setId(id);
        wbsItemRepository.save(wbsItem);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        wbsItemRepository.deleteById(id);
    }
}
