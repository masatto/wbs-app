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
        // 注意：これは部分更新（PATCH）ではなく、リクエストボディから
        // 作り直したWbsItemを丸ごと保存している。
        // なので本文に含まれなかったフィールドはJavaのデフォルト値
        // （nullや0）で上書きされてしまう。フロント側は必ず全フィールドを
        // 送り返す前提で作っている。
        wbsItem.setId(id);
        wbsItemRepository.save(wbsItem);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        // カスケード削除：自分の子タスクを探して、それぞれに対して
        // 同じdelete処理を再帰的に呼び出す（孫・ひ孫…まで辿る）。
        // 子がいなければfindByParentIdが空リストを返すので、
        // 明示的な「止める条件」を書かなくても自然に再帰が止まる。
        // 最後に自分自身を削除する。
        List<WbsItem> children=wbsItemRepository.findByParentId(id);
        for (WbsItem child :children) {
            delete(child.getId());
        }
        wbsItemRepository.deleteById(id);
    }
}
