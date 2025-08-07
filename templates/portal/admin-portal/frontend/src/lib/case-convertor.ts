export const convertToCamelCase = (text: string) => {
    // Step 1: Convert snake_case to camelCase
    const camelCase = text
        .toLowerCase()
        .split('_')
        .map((part, index) => {
            if (index === 0) {
                return part
            }
            return part.charAt(0).toUpperCase() + part.slice(1)
        })
        .join('')

    // Step 2: Handle special characters in the camelCase result
    // Dots (.) become underscores (_)
    // Colons (:) become dollar signs ($)
    return camelCase
        .replace(/\./g, '_') // dots to underscores
        .replace(/:/g, '$') // colons to dollar signs
}

export const convertToSnakeCase = (text: string, customFieldGroup?: string) => {
    // Step 1: Handle special characters
    // Underscores (_) become dots (.)
    // Dollar signs ($) become colons (:)

    // Step 2: Convert camelCase to snake_case
    const snakeCase = text
        .replace(/\$/g, ':') // dollar signs to colons
        .replace(/_/g, '.') // underscores to dots
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()

    // Step 3: Preserve custom field group case if it matches
    if (customFieldGroup) {
        const prefix = customFieldGroup.toLowerCase() + '.'

        if (snakeCase.startsWith(prefix)) {
            const fieldName = snakeCase.substring(prefix.length)
            const capitalizedFieldName = fieldName.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('_')
            return `${customFieldGroup}.${capitalizedFieldName}`
        }
    }

    return snakeCase
}