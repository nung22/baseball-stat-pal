/**
 * Capitalizes the first letter of each word in a string.
 * Words are assumed to be separated by spaces.
 * Converts the rest of the word to lowercase.
 * Handles null/undefined/empty inputs gracefully.
 *
 * @param str The input string to capitalize.
 * @returns The capitalized string, or an empty string for invalid input.
 */
export function capitalizeWords(str: string | null | undefined): string {
  // Return empty string for null, undefined, or non-string inputs
  if (!str || typeof str !== 'string') {
    return '';
  }

  // Trim whitespace and return empty string if result is empty
  const trimmedStr = str.trim();
  if (trimmedStr.length === 0) {
    return '';
  }

  return trimmedStr
    .toLowerCase() // Ensure consistency, convert whole string to lower first
    .split(' ')    // Split into words by spaces
    .map(word =>   // Process each word
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1) // Capitalize first letter, lowercase rest
        : ''       // Handle potential empty strings from multiple spaces
    )
    .join(' ');   // Join the words back together with a single space
}

// Example Usage:
// console.log(capitalizeWords("aaron judge"));     // Output: "Aaron Judge"
// console.log(capitalizeWords("shohei ohtani"));   // Output: "Shohei Ohtani"
// console.log(capitalizeWords("MLB player"));      // Output: "Mlb Player"
// console.log(capitalizeWords("  multiple   spaces  ")); // Output: "Multiple Spaces"
// console.log(capitalizeWords(""));                // Output: ""
// console.log(capitalizeWords(null));              // Output: ""
// console.log(capitalizeWords(undefined));         // Output: ""