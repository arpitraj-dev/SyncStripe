package com.taskmanager.taskmanager.controller;

import com.taskmanager.taskmanager.model.Task;
import com.taskmanager.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestHeader("X-User-Id") Long userId) {
        Task.Status statusEnum = (status != null && !status.isEmpty()) ? Task.Status.valueOf(status) : null;
        Task.Priority priorityEnum = (priority != null && !priority.isEmpty()) ? Task.Priority.valueOf(priority) : null;

        List<Task> tasks = taskService.searchTasks(userId, search, statusEnum, priorityEnum);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        Task task = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            @RequestHeader("X-User-Id") Long userId) {
        task.setUserId(userId);
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task taskDetails,
            @RequestHeader("X-User-Id") Long userId) {
        Task updatedTask = taskService.updateTask(id, taskDetails, userId);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<List<Task>> reorderTasks(
            @RequestBody List<Long> taskIds,
            @RequestHeader("X-User-Id") Long userId) {
        List<Task> tasks = taskService.reorderTasks(userId, taskIds);
        return ResponseEntity.ok(tasks);
    }
}