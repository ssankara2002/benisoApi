import { Request, Response } from 'express';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Vérifie la signature du webhook GitHub
 */
const verifyGitHubSignature = (req: Request): boolean => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return false;
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const expectedSignature = `sha256=${hash}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Gère le webhook GitHub pour déploiement automatique
 */
export const handleGitHubWebhook = async (req: Request, res: Response) => {
  try {
    // Vérifier la signature
    if (!verifyGitHubSignature(req)) {
      console.error('❌ Signature GitHub invalide');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'];
    const { ref, repository, head_commit } = req.body;

    console.log(`📬 Webhook reçu: ${event} sur ${ref}`);

    // Ne déployer que sur push vers main/master/dev
    if (event === 'push' && (ref === 'refs/heads/main' || ref === 'refs/heads/master' || ref === 'refs/heads/dev')) {
      console.log('🚀 Déclenchement du déploiement automatique...');
      console.log(`📝 Commit: ${head_commit?.message || 'N/A'}`);
      console.log(`👤 Auteur: ${head_commit?.author?.name || 'N/A'}`);

      // Répondre immédiatement à GitHub
      res.status(200).json({
        message: 'Deployment started',
        commit: head_commit?.id,
        repository: repository?.full_name
      });

      // Exécuter le déploiement en arrière-plan
      setTimeout(async () => {
        try {
          const deployScript = process.env.AUTO_DEPLOY_SCRIPT || './auto-deploy.sh';
          console.log(`⚙️  Exécution du script: ${deployScript}`);

          const { stdout, stderr } = await execAsync(deployScript);

          if (stdout) console.log('📤 Output:', stdout);
          if (stderr) console.error('⚠️  Stderr:', stderr);

          console.log('✅ Déploiement automatique terminé avec succès');
        } catch (error: any) {
          console.error('❌ Erreur lors du déploiement automatique:', error.message);
          if (error.stdout) console.log('Output:', error.stdout);
          if (error.stderr) console.error('Error output:', error.stderr);
        }
      }, 1000);

    } else {
      console.log(`ℹ️  Événement ignoré: ${event} sur ${ref}`);
      res.status(200).json({ message: 'Event ignored' });
    }

  } catch (error: any) {
    console.error('❌ Erreur webhook:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Test du webhook (optionnel)
 */
export const testWebhook = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString()
  });
};
