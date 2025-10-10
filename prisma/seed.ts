import { PrismaClient, UserRole, OrgRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create owner/admin user
  const ownerEmail = process.env.OWNER_EMAIL || 'sean@seezee.studio'
  const ownerName = process.env.OWNER_NAME || 'Sean - SeeZee Studio'

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: ownerName,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created owner user:', owner.email)

  // Create additional admin users
  const adminEmails = [
    'zach@seezee.studio',
    'seezee.enterprises@gmail.com'
  ]

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: UserRole.ADMIN },
      create: {
        email,
        name: email.split('@')[0],
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
    })
    console.log(`✅ Created/Updated admin user: ${email}`)
  }

  // Create SeeZee Studio organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'seezee-studio' },
    update: {},
    create: {
      name: 'SeeZee Studio',
      slug: 'seezee-studio',
      email: ownerEmail,
      website: 'https://seezee.studio',
      country: 'US',
      members: {
        create: {
          userId: owner.id,
          role: OrgRole.OWNER,
        },
      },
    },
  })

  console.log('✅ Created organization:', organization.name)

  // Create pricing rules
  const pricingRules = [
    {
      name: 'Standard Website',
      description: 'Professional business website with modern design',
      serviceType: 'website',
      basePrice: 2500,
      features: {
        responsive: 0,
        cms: 500,
        contact_form: 0,
        seo: 300,
        analytics: 200,
        blog: 400,
        gallery: 300,
        social_media: 100,
      },
    },
    {
      name: 'E-commerce Store',
      description: 'Full-featured online store with payment processing',
      serviceType: 'ecommerce',
      basePrice: 5000,
      features: {
        responsive: 0,
        product_catalog: 0,
        shopping_cart: 0,
        payment_processing: 800,
        inventory_management: 600,
        order_management: 400,
        customer_accounts: 300,
        analytics: 200,
        seo: 300,
        reviews: 250,
      },
    },
    {
      name: 'Web Application',
      description: 'Custom web application with advanced functionality',
      serviceType: 'webapp',
      basePrice: 8000,
      features: {
        user_authentication: 800,
        database_integration: 1200,
        api_development: 1500,
        admin_dashboard: 1000,
        real_time_features: 1200,
        third_party_integrations: 800,
        automated_testing: 600,
        deployment: 400,
      },
    },
    {
      name: 'Landing Page',
      description: 'High-converting single page for marketing campaigns',
      serviceType: 'landing',
      basePrice: 1200,
      features: {
        responsive: 0,
        contact_form: 0,
        analytics: 200,
        a_b_testing: 300,
        lead_capture: 250,
        social_proof: 150,
      },
    },
  ]

  for (const rule of pricingRules) {
    const created = await prisma.pricingRule.upsert({
      where: { 
        name: rule.name,
      },
      update: {},
      create: {
        name: rule.name,
        description: rule.description,
        serviceType: rule.serviceType,
        basePrice: rule.basePrice,
        features: rule.features,
        rushMultiplier: 1.5,
        standardMultiplier: 1.0,
        extendedMultiplier: 0.9,
        active: true,
      },
    })
    console.log(`✅ Created pricing rule: ${created.name}`)
  }

  // Create sample lead for testing
  const sampleLead = await prisma.lead.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corp',
      message: 'Looking for a new company website with modern design and CMS integration.',
      serviceType: 'website',
      timeline: 'standard',
      budget: '2500-5000',
      requirements: {
        features: ['cms', 'contact_form', 'seo', 'analytics'],
        pages: 8,
        design_preference: 'modern',
        content_ready: false,
      },
      source: 'website',
    },
  })

  console.log('✅ Created sample lead:', sampleLead.email)

  // Create legacy sample messages (for backward compatibility)
  const sampleMessages = [
    {
      name: 'Mike Wilson',
      email: 'mike@example.com',
      subject: 'Project Inquiry',
      content: 'I\'m interested in your web development services',
      status: 'UNREAD'
    },
    {
      name: 'Lisa Chen',
      email: 'lisa@company.net',
      subject: 'Website Redesign',
      content: 'We need to redesign our company website',
      status: 'REPLIED'
    }
  ]

  for (const message of sampleMessages) {
    const existingMessage = await prisma.message.findFirst({
      where: { email: message.email }
    })
    
    if (!existingMessage) {
      await prisma.message.create({
        data: message
      })
      console.log(`✅ Created message: ${message.name}`)
    }
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
