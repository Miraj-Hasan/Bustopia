package com.example.BusTopia.DatabaseEntity.Converters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.List;

@Converter
public class SeatGridConverter implements AttributeConverter<List<List<String>>, String> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<List<String>> grid) {
        try {
            return mapper.writeValueAsString(grid);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to convert seat layout to JSON", e);
        }
    }

    @Override
    public List<List<String>> convertToEntityAttribute(String dbData) {
        try {
            return mapper.readValue(dbData, new TypeReference<>() {});
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to convert JSON to seat layout", e);
        }
    }
}

