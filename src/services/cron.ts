import { prisma } from '@/lib/prisma';

/**
 * Cron service for scheduled publication
 * This should be called periodically (e.g., every minute) to check for planned posts/advs
 * that should be published
 */

export async function publishScheduledContent() {
  const now = new Date();
  
  try {
    // Find all posts with status PLANNED and date <= now
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'PLANNED',
        date: {
          lte: now,
        },
      },
    });

    // Update posts to PUBLISHED
    for (const post of postsToPublish) {
      await prisma.post.update({
        where: { id: post.id },
        data: { status: 'PUBLISHED' },
      });
      console.log(`📝 Published post: ${post.title} (${post.id})`);
    }

    // Find all advs with status PLANNED and date <= now
    const advsToPublish = await prisma.adv.findMany({
      where: {
        status: 'PLANNED',
        date: {
          lte: now,
        },
      },
    });

    // Update advs to PUBLISHED
    for (const adv of advsToPublish) {
      await prisma.adv.update({
        where: { id: adv.id },
        data: { status: 'PUBLISHED' },
      });
      console.log(`📢 Published adv: ${adv.title} (${adv.id})`);
    }

    return {
      publishedPosts: postsToPublish.length,
      publishedAdvs: advsToPublish.length,
    };
  } catch (error) {
    console.error('❌ Error in publishScheduledContent:', error);
    throw error;
  }
}

/**
 * Manual trigger endpoint for testing
 */
export async function triggerPublishNow() {
  console.log('🚀 Manually triggering scheduled publication...');
  const result = await publishScheduledContent();
  console.log(`✅ Published ${result.publishedPosts} posts and ${result.publishedAdvs} advs`);
  return result;
}
