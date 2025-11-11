/**
 * Guía de Testing Manual - Autenticación Firebase
 * 
 * Esta guía describe cómo probar manualmente los endpoints de autenticación
 */

export const testingGuide = {
  title: 'Guía de Testing Manual - Firebase Authentication',
  
  prerequisites: [
    'Servidor API corriendo (npm start o npm run dev)',
    'Firebase Authentication configurado',
    'Token de Firebase Auth válido (obtenido del frontend o Firebase Console)',
    'Herramienta para hacer requests HTTP (curl, Postman, Insomnia, etc.)'
  ],

  endpoints: [
    {
      name: 'POST /api/v1/auth/login',
      description: 'Login con token de Firebase Auth',
      method: 'POST',
      url: 'http://localhost:3000/api/v1/auth/login',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        idToken: 'TOKEN_DE_FIREBASE_AUTH'
      },
      expectedSuccess: {
        status: 200,
        response: {
          success: true,
          message: 'Login exitoso',
          data: {
            user: { /* datos del usuario */ },
            token: 'TOKEN'
          }
        }
      },
      testCases: [
        {
          name: 'Login con token válido',
          body: { idToken: 'TOKEN_VALIDO' },
          expectedStatus: 200
        },
        {
          name: 'Login sin token',
          body: {},
          expectedStatus: 400
        },
        {
          name: 'Login con token inválido',
          body: { idToken: 'token-invalido' },
          expectedStatus: 401
        },
        {
          name: 'Login con token expirado',
          body: { idToken: 'TOKEN_EXPIRADO' },
          expectedStatus: 401
        }
      ]
    },
    {
      name: 'POST /api/v1/auth/register',
      description: 'Registro de nuevo usuario',
      method: 'POST',
      url: 'http://localhost:3000/api/v1/auth/register',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: 'usuario@example.com',
        password: 'Password123',
        name: 'Nombre Usuario',
        idToken: 'TOKEN_OPCIONAL'
      },
      expectedSuccess: {
        status: 201,
        response: {
          success: true,
          message: 'Usuario registrado exitosamente',
          data: {
            user: { /* datos del usuario */ }
          }
        }
      }
    },
    {
      name: 'POST /api/v1/auth/verify',
      description: 'Verificar token de autenticación',
      method: 'POST',
      url: 'http://localhost:3000/api/v1/auth/verify',
      body: {
        idToken: 'TOKEN_DE_FIREBASE_AUTH'
      },
      expectedSuccess: {
        status: 200,
        response: {
          success: true,
          message: 'Token válido',
          data: {
            user: { /* datos del usuario */ }
          }
        }
      }
    },
    {
      name: 'GET /api/v1/auth/me',
      description: 'Obtener perfil del usuario autenticado',
      method: 'GET',
      url: 'http://localhost:3000/api/v1/auth/me',
      headers: {
        'Authorization': 'Bearer TOKEN_DE_FIREBASE_AUTH'
      },
      expectedSuccess: {
        status: 200,
        response: {
          success: true,
          data: {
            user: { /* perfil completo del usuario */ }
          }
        }
      },
      testCases: [
        {
          name: 'Obtener perfil con token válido',
          headers: { 'Authorization': 'Bearer TOKEN_VALIDO' },
          expectedStatus: 200
        },
        {
          name: 'Obtener perfil sin token',
          headers: {},
          expectedStatus: 401
        },
        {
          name: 'Obtener perfil con token inválido',
          headers: { 'Authorization': 'Bearer token-invalido' },
          expectedStatus: 401
        }
      ]
    },
    {
      name: 'GET /api/v1/users',
      description: 'Obtener todos los usuarios (requiere admin)',
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users',
      headers: {
        'Authorization': 'Bearer TOKEN_ADMIN'
      },
      expectedSuccess: {
        status: 200,
        response: {
          success: true,
          data: [ /* lista de usuarios */ ],
          pagination: { /* datos de paginación */ }
        }
      },
      testCases: [
        {
          name: 'Listar usuarios como admin',
          headers: { 'Authorization': 'Bearer TOKEN_ADMIN' },
          expectedStatus: 200
        },
        {
          name: 'Listar usuarios como usuario normal',
          headers: { 'Authorization': 'Bearer TOKEN_USER' },
          expectedStatus: 403
        },
        {
          name: 'Listar usuarios sin autenticación',
          headers: {},
          expectedStatus: 401
        }
      ]
    },
    {
      name: 'POST /api/v1/solicitudes',
      description: 'Crear solicitud de crédito (requiere auth)',
      method: 'POST',
      url: 'http://localhost:3000/api/v1/solicitudes',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer TOKEN_DE_FIREBASE_AUTH'
      },
      body: {
        /* datos de solicitud */
      },
      expectedSuccess: {
        status: 201,
        response: {
          success: true,
          message: 'Solicitud de crédito creada exitosamente',
          data: { /* solicitud creada */ }
        }
      },
      testCases: [
        {
          name: 'Crear solicitud con autenticación',
          headers: { 'Authorization': 'Bearer TOKEN_VALIDO' },
          expectedStatus: 201
        },
        {
          name: 'Crear solicitud sin autenticación',
          headers: {},
          expectedStatus: 401
        }
      ]
    }
  ],

  testScenarios: [
    {
      name: 'Flujo completo de autenticación',
      steps: [
        '1. Usuario se registra en Firebase Auth (frontend)',
        '2. Frontend obtiene idToken de Firebase',
        '3. Frontend envía idToken a POST /api/v1/auth/login',
        '4. Backend verifica token y sincroniza usuario con Firestore',
        '5. Backend retorna datos del usuario',
        '6. Frontend almacena token y datos del usuario',
        '7. Frontend usa token en header Authorization para requests protegidos'
      ]
    },
    {
      name: 'Protección de rutas',
      steps: [
        '1. Intentar acceder a ruta protegida sin token → 401',
        '2. Intentar acceder con token inválido → 401',
        '3. Intentar acceder con token expirado → 401',
        '4. Intentar acceder con token válido → 200',
        '5. Intentar acceder a ruta de admin como usuario normal → 403'
      ]
    },
    {
      name: 'Ownership de recursos',
      steps: [
        '1. Usuario A crea una solicitud',
        '2. Usuario A puede ver/editar/eliminar su solicitud',
        '3. Usuario B NO puede ver/editar/eliminar solicitud de Usuario A',
        '4. Admin puede ver/editar/eliminar cualquier solicitud'
      ]
    }
  ],

  curlExamples: {
    login: `curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"idToken":"TU_TOKEN_AQUI"}'`,

    getMe: `curl -X GET http://localhost:3000/api/v1/auth/me \\
  -H "Authorization: Bearer TU_TOKEN_AQUI"`,

    getUsers: `curl -X GET http://localhost:3000/api/v1/users \\
  -H "Authorization: Bearer TOKEN_ADMIN"`,

    createSolicitud: `curl -X POST http://localhost:3000/api/v1/solicitudes \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TU_TOKEN_AQUI" \\
  -d '{
    "nombreCompleto": "Juan Pérez",
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    ...
  }'`
  }
};

export default testingGuide;

