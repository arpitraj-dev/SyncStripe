package com.taskmanager.taskmanager.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.taskmanager.taskmanager.model.Task;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AiService {
    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public AiSuggestion getTaskSuggestion(String title) throws IOException, InterruptedException {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            // Fallback mock suggestion if no API key
            return new AiSuggestion(
                    "Please provide more details about: " + title,
                    Task.Priority.MEDIUM
            );
        }

        String prompt = String.format(
                "Given this task title: \"%s\", generate a proper task description and suggest a priority level (LOW, MEDIUM, or HIGH). " +
                "Consider the urgency and importance. Return only JSON with format: {\"description\": \"...\", \"priority\": \"...\"}",
                title
        );

        // Safely construct request JSON using Gson to handle any escape characters
        JsonObject jsonBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject contentObj = new JsonObject();
        JsonArray parts = new JsonArray();
        JsonObject partObj = new JsonObject();
        partObj.addProperty("text", prompt);
        parts.add(partObj);
        contentObj.add("parts", parts);
        contents.add(contentObj);
        jsonBody.add("contents", contents);

        String requestBody = jsonBody.toString();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1/models/" + geminiModel + ":generateContent?key=" + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("AI API error: " + response.body());
        }

        JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
        String text = jsonResponse.getAsJsonArray("candidates")
                .get(0).getAsJsonObject()
                .getAsJsonObject("content")
                .getAsJsonArray("parts")
                .get(0).getAsJsonObject()
                .get("text").getAsString();

        // Extract JSON string between first '{' and last '}' to strip markdown blocks cleanly
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1 || end < start) {
            throw new RuntimeException("No JSON object found in AI response: " + text);
        }
        String jsonContent = text.substring(start, end + 1);
        JsonObject suggestion = JsonParser.parseString(jsonContent).getAsJsonObject();

        String description = suggestion.has("description") ? suggestion.get("description").getAsString() : "";
        String priorityStr = suggestion.has("priority") ? suggestion.get("priority").getAsString().trim().toUpperCase() : "MEDIUM";
        
        Task.Priority priority;
        try {
            priority = Task.Priority.valueOf(priorityStr);
        } catch (IllegalArgumentException e) {
            priority = Task.Priority.MEDIUM;
        }

        return new AiSuggestion(description, priority);
    }

    public String getAvailableModels() throws IOException, InterruptedException {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "{\"error\": \"No API key loaded\"}";
        }
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://generativelanguage.googleapis.com/v1/models?key=" + geminiApiKey))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public static class AiSuggestion {
        private String description;
        private Task.Priority priority;

        public AiSuggestion(String description, Task.Priority priority) {
            this.description = description;
            this.priority = priority;
        }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Task.Priority getPriority() { return priority; }
        public void setPriority(Task.Priority priority) { this.priority = priority; }
    }
}