#!/usr/bin/env node

/**
 * Fast Vercel Deployment Script
 * Automatic deployment with environment validation
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 İlaç Takip Sistemi - Hızlı Vercel Deployment');
console.log('============================================\n');

// Check prerequisites
console.log('📋 Ön kontroller yapılıyor...\n');

try {
  // Check package.json
  if (!fs.existsSync('./package.json')) {
    throw new Error('package.json bulunamadı');
  }

  // Check vercel.json
  if (!fs.existsSync('./vercel.json')) {
    throw new Error('vercel.json bulunamadı');
  }

  // Check .env.local
  if (!fs.existsSync('./.env.local')) {
    throw new Error('.env.local bulunamadı. Lütfen Google API bilgilerini kontrol edin');
  }

  console.log('✅ Temel dosyalar mevcut\n');

  // Test build
  console.log('🔨 Build testi yapılıyor...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build başarılı\n');
  } catch (error) {
    console.log('❌ Build başarısız!');
    console.log('🔧 Local\'de düzelterek devam edin:\n');
    console.log('npm run build');
    console.log('npm run dev\n');
    throw new Error('Build hatası düzeltilmeden deploy edilemez');
  }

} catch (error) {
  console.log('❌ ' + error.message);
  process.exit(1);
}

// Deploy questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('📝 Deployment bilgilerini girin:\n');

    // Get deployment info
    const projectName = await askQuestion('📦 Vercel proje adı (ilac-takip-[isiminiz]): ');
    if (!projectName.trim()) {
      console.log('❌ Proje adı gerekli');
      return;
    }

    const hasGoogleKeys = await askQuestion('🔐 Google API anahtarlarınız hazır mı? (y/n): ');
    if (hasGoogleKeys.toLowerCase() !== 'y' && hasGoogleKeys.toLowerCase() !== 'yes') {
      console.log('\n⚠️  GUİ akışı:');
      console.log('1. Google Cloud Console açın');
      console.log('2. APIs & Services > Credentials');
      console.log('3. OAuth 2.0 Client ID oluşturun');
      console.log('4. Production URI ekleyin: https://' + projectName + '.vercel.app');
      console.log('5. API Key oluşturun\n');
      return;
    }

    console.log('\n🚀 Deployment başlatılıyor...\n');

    // Check git status
    try {
      execSync('git add .');
      execSync('git commit -m "Deploy to Vercel"');
      execSync('git push origin main');
      console.log('✅ Kod GitHub\'a push edildi\n');
    } catch (error) {
      console.log('❌ Git push hatası. Manual push yapın');
    }

    // Install Vercel CLI if needed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI mevcut\n');
    } catch {
      console.log('📦 Vercel CLI yükleniyor...');
      execSync('npm install -g vercel');
      console.log('✅ Vercel CLI yüklendi\n');
    }

    // Login to Vercel
    console.log('🔐 Vercel girişi (tarayıcı açılacak)...');
    try {
      execSync('vercel login', { stdio: 'inherit' });
    } catch {
      console.log('⚠️  Manual login gerekli');
      execSync('vercel login');
    }

    // Deploy
    console.log('🏗️  Deploying to Vercel...\n');
    execSync('vercel --prod --yes', { stdio: 'inherit' });

    // Post-deploy instructions
    const vercelUrl = `https://${projectName}.vercel.app`;

    console.log('\n🎉 DEPLOYMENT BAŞARILI!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Site: ${vercelUrl}`);
    console.log(`⚙️  Settings: ${vercelUrl}/settings`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Kesinlikle YAPILMASI Gerekenler:\n');

    console.log('1️⃣  Environment Variables Ayarlayın:');
    console.log(`   ${vercelUrl}/settings`);
    console.log('   - NEXTAUTH_URL: ' + vercelUrl);
    console.log('   - NEXTAUTH_SECRET: [openssl rand -base64 32]');
    console.log('   - GOOGLE_CLIENT_ID [Google Cloud]');
    console.log('   - GOOGLE_CLIENT_SECRET [Google Cloud]');
    console.log('   - GOOGLE_API_KEY [Google Cloud]');
    console.log('');

    console.log('2️⃣  Google Cloud Console Güncelleyin:');
    console.log('   APIs & Services > Credentials > OAuth Client');
    console.log(`   Redirect URIs: ${vercelUrl}/api/auth/callback/google`);
    console.log('');

    console.log('3️⃣  İlk Kullanıcıyı Test Edin:');
    console.log(`   🔗 ${vercelUrl}`);
    console.log('   - Giriş yapın');
    console.log('   - Profil kurun');
    console.log('   - Kurulum rehberini takip edin');
    console.log('');

    console.log('🔧 Troubleshooting:');
    console.log('   - Build hataları: Vercel Dashboard > Functions logs');
    console.log('   - Runtime errors: Browser console');
    console.log('   - Auth issues: Google OAuth redirect URI');

  } finally {
    rl.close();
  }
}

main().catch(console.error);
