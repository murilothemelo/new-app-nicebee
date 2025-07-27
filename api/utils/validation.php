<?php
class Validator {
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function password($password) {
        return strlen($password) >= 8 && preg_match('/^(?=.*[A-Za-z])(?=.*\d)/', $password);
    }
    
    public static function phone($phone) {
        return preg_match('/^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/', $phone);
    }
    
    public static function required($value) {
        return !empty(trim($value));
    }
    
    public static function maxLength($value, $max) {
        return strlen($value) <= $max;
    }
    
    public static function minLength($value, $min) {
        return strlen($value) >= $min;
    }
    
    public static function sanitize($input) {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    public static function validateEnum($value, $allowed_values) {
        return in_array($value, $allowed_values);
    }
}
?>