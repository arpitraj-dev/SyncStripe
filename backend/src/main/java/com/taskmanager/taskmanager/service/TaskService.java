package com.taskmanager.taskmanager.service;

import com.taskmanager.taskmanager.model.Task;
import com.taskmanager.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTasks(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public List<Task> getTasksByStatus(Long userId, Task.Status status) {
        return taskRepository.findByUserIdAndStatus(userId, status);
    }

    public List<Task> getTasksByPriority(Long userId, Task.Priority priority) {
        return taskRepository.findByUserIdAndPriority(userId, priority);
    }

    public List<Task> getTasksByStatusAndPriority(Long userId, Task.Status status, Task.Priority priority) {
        return taskRepository.findByUserIdAndStatusAndPriority(userId, status, priority);
    }

    public Task getTaskById(Long id, Long userId) {
        return taskRepository.findById(id)
                .filter(task -> task.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public Task createTask(Task task) {
        Double maxPosition = taskRepository.findMaxPositionByUserId(task.getUserId());
        task.setPositionOrder(maxPosition == null ? 1000.0 : maxPosition + 1000.0);
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails, Long userId) {
        Task task = getTaskById(id, userId);
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setDueDate(taskDetails.getDueDate());
        task.setPriority(taskDetails.getPriority());
        task.setStatus(taskDetails.getStatus());
        if (taskDetails.getPositionOrder() != null) {
            task.setPositionOrder(taskDetails.getPositionOrder());
        }
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, Long userId) {
        Task task = getTaskById(id, userId);
        taskRepository.delete(task);
    }

    public List<Task> reorderTasks(Long userId, List<Long> taskIds) {
        List<Task> tasks = taskRepository.findByUserId(userId);
        for (Long taskId : taskIds) {
            Task task = tasks.stream()
                    .filter(t -> t.getId().equals(taskId))
                    .findFirst()
                    .orElse(null);
            if (task != null) {
                // Could add ordering logic here if needed
            }
        }
        return tasks;
    }

    public List<Task> searchTasks(Long userId, String title, Task.Status status, Task.Priority priority) {
        String titleSearch = (title != null && !title.trim().isEmpty()) ? "%" + title.trim() + "%" : null;
        return taskRepository.searchTasks(userId, titleSearch, status, priority);
    }
}