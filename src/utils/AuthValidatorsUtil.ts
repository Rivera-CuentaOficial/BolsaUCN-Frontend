//src/utils/AuthValidatorsUtil.ts

export const validators = {
    required: (value: string, fieldName: string = "Este campo") => {
        if (!value.trim()) return `${fieldName} es obligatorio.`;
        return null;
    },
    minLenght: (value: string, min: number, fieldName: string = "Este campo") => {
        if (value.length < min) return `${fieldName} debe tener al menos ${min} caracteres.`;
        return null;
    },
    maxLenght: (value: string, max: number, fieldName: string = "Este campo") => {
        if (value.length > max) return `${fieldName} debe tener como máximo ${max} caracteres.`;
        return null;
    },
    lettersOnly: (value: string, fieldName: string = "Este campo") => {
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) 
            return `${fieldName} solo debe contener letras y espacios.`;
        return null;
    },
    hasUpperCase: (value: string, fieldName: string = "Este campo") => {
        if (!/[A-Z]/.test(value)) 
            return `${fieldName} debe contener al menos una letra mayúscula.`;
        return null;
    },
    hasLowerCase: (value: string, fieldName: string = "Este campo") => {
        if (!/[a-z]/.test(value))
            return `${fieldName} debe contener al menos una letra minúscula.`;
        return null;
    },
    hasNumber: (value: string, fieldName: string = "Este campo") => {
        if (!/[0-9]/.test(value)) 
            return `${fieldName} debe contener al menos un número.`;
        return null;
    },
    hasSpecialChar: (value: string, fieldName: string = "Este campo") => {
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) 
            return `${fieldName} debe contener al menos un carácter especial.`;
        return null;
    },

    //Valida el nombre. Aplicable a Name, Lastname, LegalName, y CompanyName
    name: (value: string, fieldName: string = "Nombre") => {
        return (validators.required(value, fieldName) ||
                validators.minLenght(value, 2, fieldName) ||
                validators.maxLenght(value, 50, fieldName) ||
                validators.lettersOnly(value, fieldName));
    },

    //Valida los campos de contraseña
    password: (value: string, fieldName: string = "Contraseña") => {
        return (validators.required(value, fieldName) ||
                validators.minLenght(value, 8, fieldName) ||
                validators.hasUpperCase(value, fieldName) ||
                validators.hasLowerCase(value, fieldName) ||
                validators.hasNumber(value, fieldName) ||
                validators.hasSpecialChar(value, fieldName));
    },

    confirmPassword: (value: string, password: string) => {
    if (!value) return "Debes confirmar la contraseña";
    if (value !== password) return "Las contraseñas no coinciden";
    return null;
  },

    //Valida los campos de Email
    studentEmail: (value: string, fieldName: string = "Email") => {
        if (!value.trim()) return `${fieldName} es obligatorio.`;
        if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
            return "Correo inválido (sin @alumnos.ucn.cl)";
        }
        return null;
    },

    regularEmail: (value: string, fieldName: string = "Email") => {
        if (!value.trim()) return `${fieldName} es obligatorio.`;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) return "Correo electrónico inválido";
        return null;
    },

    //Valida el RUT chileno
    rut: (value: string, fieldName: string = "RUT") => {
        if (!value.trim()) return `${fieldName} es obligatorio.`;
        const cleanRut = value.replace(/\./g, '').replace(/-/g, '');
        if (cleanRut.length < 8 || cleanRut.length > 10) 
            return "RUT inválido (formato: 12345678-9)";
        
        if (!/^[0-9]+[kK0-9]{1}$/.test(cleanRut)) 
            return "Formato de RUT inválido";
        
        // Modulo 11 para dígito verificador
        const rutDigits = cleanRut.slice(0, -1);
        const verifier = cleanRut.slice(-1).toLowerCase();
        let sum = 0;
        let multiplier = 2;

        for (let i = rutDigits.length - 1; i >= 0; i--) {
        sum += parseInt(rutDigits[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const expectedVerifier = 11 - (sum % 11);
        const calculatedVerifier =
        expectedVerifier === 11 ? '0' : expectedVerifier === 10 ? 'k' : expectedVerifier.toString();

        if (verifier !== calculatedVerifier) {
        return "RUT inválido (dígito verificador incorrecto)";
        }
        return null;
    },

    //Valida el telefono con codigo de area chilena
    phone: (value: string) => {
        if (!value.trim()) return "El teléfono es requerido";

        const digitsOnly = value.replace(/\D/g, '');

        if (!/^[0-9]{9}$/.test(digitsOnly)) 
            return "Debe tener 9 dígitos (ej: 9 1234 5678)";
        return null;
  },
}

/**
 * Evalúa la fortaleza de una contraseña
 * @param password Contraseña a evaluar
 * @returns Objeto con la fortaleza, etiqueta y color asociado
 */
export function getPasswordStrength(password: string): {
    strength: number;
    label: string;
    color: string;
} {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Débil", color: "bg-red-500" };
    if (strength === 3) return { strength, label: "Media", color: "bg-yellow-500" };
    if (strength === 4) return { strength, label: "Buena", color: "bg-blue-500" };
    return { strength, label: "Excelente", color: "bg-green-500" };
}