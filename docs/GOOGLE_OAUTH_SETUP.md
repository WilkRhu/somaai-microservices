# Configuração de Google OAuth

## 📋 Pré-requisitos

- Conta Google
- Google Cloud Console acesso
- Projeto criado no Google Cloud

---

## 🔧 Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar um projeto" → "Novo projeto"
3. Digite o nome: `SomaAI`
4. Clique em "Criar"

---

## 🔑 Passo 2: Criar Credenciais OAuth 2.0

### 2.1 Ativar Google+ API
1. No console, vá para "APIs e Serviços" → "Biblioteca"
2. Procure por "Google+ API"
3. Clique em "Ativar"

### 2.2 Criar Credenciais
1. Vá para "APIs e Serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "ID do cliente OAuth"
3. Se solicitado, configure a tela de consentimento primeiro:
   - Tipo de usuário: "Externo"
   - Clique em "Criar"

### 2.3 Configurar Tela de Consentimento
1. Preencha os campos obrigatórios:
   - **Nome do app**: SomaAI
   - **Email de suporte**: seu-email@gmail.com
   - **Email de contato**: seu-email@gmail.com
2. Clique em "Salvar e continuar"
3. Pule os escopos (clique em "Salvar e continuar")
4. Adicione usuários de teste (seu email)
5. Clique em "Salvar e continuar"

### 2.4 Criar ID do Cliente
1. Volte para "Credenciais"
2. Clique em "Criar credenciais" → "ID do cliente OAuth"
3. Tipo de aplicativo: "Aplicativo da Web"
4. Nome: `SomaAI Web Client`
5. Em "URIs autorizados de redirecionamento", adicione:
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3000/api/auth/google
   http://localhost:3010/api/auth/google/callback
   https://seu-dominio.com/api/auth/google/callback
   ```
6. Clique em "Criar"

---

## 📝 Passo 3: Copiar Credenciais

Após criar o cliente OAuth, você verá:
- **ID do cliente**: `xxx.apps.googleusercontent.com`
- **Segredo do cliente**: `xxx`

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### No arquivo `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu-id-do-cliente.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-segredo-do-cliente
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### No arquivo `.env.example`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

---

## 🧪 Passo 5: Testar Google Login

### Via Swagger (http://localhost:3000/api/docs)

1. Abra o Swagger
2. Procure por `POST /api/auth/google`
3. Clique em "Try it out"
4. Preencha o body:

```json
{
  "idToken": "seu-id-token-do-google",
  "email": "seu-email@gmail.com",
  "firstName": "Seu",
  "lastName": "Nome",
  "avatar": "https://lh3.googleusercontent.com/...",
  "role": "USER"
}
```

5. Clique em "Execute"

### Via cURL

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "seu-id-token-do-google",
    "email": "seu-email@gmail.com",
    "firstName": "Seu",
    "lastName": "Nome",
    "avatar": "https://lh3.googleusercontent.com/...",
    "role": "USER"
  }'
```

### Via Postman

1. Crie uma nova requisição POST
2. URL: `http://localhost:3000/api/auth/google`
3. Body (raw JSON):

```json
{
  "idToken": "seu-id-token-do-google",
  "email": "seu-email@gmail.com",
  "firstName": "Seu",
  "lastName": "Nome",
  "avatar": "https://lh3.googleusercontent.com/...",
  "role": "USER"
}
```

4. Clique em "Send"

---

## 📱 Passo 6: Integrar no Frontend

### React/Next.js com `@react-oauth/google`

```bash
npm install @react-oauth/google
```

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const handleGoogleLogin = async (credentialResponse) => {
    const response = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: credentialResponse.credential,
        email: credentialResponse.email,
        firstName: credentialResponse.given_name,
        lastName: credentialResponse.family_name,
        avatar: credentialResponse.picture,
        role: 'USER'
      })
    });
    
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    // Redirecionar para dashboard
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleLogin onSuccess={handleGoogleLogin} />
    </GoogleOAuthProvider>
  );
}
```

### Flutter com `google_sign_in`

```dart
import 'package:google_sign_in/google_sign_in.dart';

final GoogleSignIn _googleSignIn = GoogleSignIn();

Future<void> handleGoogleLogin() async {
  try {
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return;

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
    
    final response = await http.post(
      Uri.parse('http://localhost:3000/api/auth/google'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'idToken': googleAuth.idToken,
        'email': googleUser.email,
        'firstName': googleUser.displayName?.split(' ')[0],
        'lastName': googleUser.displayName?.split(' ').last,
        'avatar': googleUser.photoUrl,
        'role': 'USER'
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Salvar tokens
      // Redirecionar para dashboard
    }
  } catch (error) {
    print('Erro ao fazer login com Google: $error');
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "Invalid Client ID"
- Verifique se o `GOOGLE_CLIENT_ID` está correto
- Certifique-se de que o ID não tem espaços em branco

### Erro: "Redirect URI mismatch"
- Adicione a URL de callback no Google Cloud Console
- Certifique-se de que a URL no `.env` corresponde exatamente

### Erro: "Invalid ID Token"
- Verifique se o `idToken` é válido
- Certifique-se de que o token não expirou

### Erro: "User already exists"
- O usuário já está registrado com esse email
- Use a rota de login normal ou crie uma nova conta com outro email

---

## 🔄 Fluxo Completo

```
1. Usuário clica em "Login com Google"
   ↓
2. Google abre janela de autenticação
   ↓
3. Usuário faz login com sua conta Google
   ↓
4. Google retorna ID Token
   ↓
5. Frontend envia ID Token para backend
   ↓
6. Backend valida o token
   ↓
7. Se novo usuário, cria conta
   Se usuário existente, atualiza último login
   ↓
8. Backend retorna JWT tokens
   ↓
9. Frontend salva tokens e redireciona para dashboard
```

---

## 📚 Referências

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React Google Login](https://www.npmjs.com/package/@react-oauth/google)
- [Flutter Google Sign In](https://pub.dev/packages/google_sign_in)

---

## ✅ Checklist

- [ ] Projeto criado no Google Cloud Console
- [ ] Google+ API ativada
- [ ] Tela de consentimento configurada
- [ ] ID do cliente OAuth criado
- [ ] URIs de redirecionamento adicionadas
- [ ] Variáveis de ambiente configuradas
- [ ] Teste via Swagger/Postman realizado
- [ ] Frontend integrado
- [ ] Fluxo completo testado

