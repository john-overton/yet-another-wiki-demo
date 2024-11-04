# Code Examples

Here are some code examples in different programming languages\:

## JavaScript Example

```java
function calculateFactorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * calculateFactorial(n - 1);
}

const result = calculateFactorial(5);
console.log(`Factorial of 5 is: ${result}`);
```

## C Example

```c
#include <stdio.h>

int main() {
    int numbers[] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for(int i = 0; i < 5; i++) {
        sum += numbers[i];
    }
    
    printf("Sum of array elements: %d\n", sum);
    return 0;
}
```

## HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <p>This is a sample HTML page.</p>
    </div>
</body>
</html>
```

## SQL Example

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT username, email 
FROM users 
WHERE created_at >= '2024-01-01'
ORDER BY username ASC;
```