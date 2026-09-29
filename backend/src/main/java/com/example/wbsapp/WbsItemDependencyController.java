package com.example.wbsapp;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wbs-item-dependencies")
@RequiredArgsConstructor
public class WbsItemDependencyController {

    private final WbsItemDependencyRepository wbsItemDependencyRepository;

    // 特定タスクの先行タスク一覧を取る想定だが、まずは全件取得で用意しておく。
    // フロント側で必要ならtaskIdごとにグルーピングする。
    @GetMapping
    public List<WbsItemDependency> findAll() {
        return wbsItemDependencyRepository.findAll();
    }

    @PostMapping
    public WbsItemDependency create(@RequestBody WbsItemDependency dependency) {
        return wbsItemDependencyRepository.save(dependency);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        wbsItemDependencyRepository.deleteById(id);
    }
}
