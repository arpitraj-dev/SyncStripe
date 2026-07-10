package com.taskmanager.taskmanager.controller;

import com.taskmanager.taskmanager.model.Task;
import com.taskmanager.taskmanager.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {
    @Autowired
    private AiService aiService;

    @PostMapping("/suggest")
    public ResponseEntity<?> suggestTask(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        if (title == null || title.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
        }

        try {
            AiService.AiSuggestion suggestion = aiService.getTaskSuggestion(title);
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get AI suggestion: " + e.getMessage()));
        }
    }

    @GetMapping("/models")
    public ResponseEntity<?> listModels() {
        try {
            String modelsList = aiService.getAvailableModels();
            // Return raw response string directly as JSON
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(modelsList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to list available models: " + e.getMessage()));
        }
    }
}