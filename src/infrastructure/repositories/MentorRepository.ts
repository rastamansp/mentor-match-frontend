import { IMentorRepository, MentorFilters } from '@domain/repositories/IMentorRepository';
import { Mentor } from '@domain/entities/Mentor.entity';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { ILogger } from '../logging/Logger';

// Mock data - same as in pages
const MOCK_MENTORS: Mentor[] = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Senior Product Manager",
    company: "Google",
    specialty: "Product Management",
    rating: 4.9,
    reviews: 127,
    price: 200,
    location: "São Paulo, SP",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    skills: ["Product Strategy", "Agile", "User Research"],
    bio: "Com mais de 10 anos de experiência em Product Management, já liderei o desenvolvimento de produtos que impactaram milhões de usuários. Minha paixão é ajudar profissionais a desenvolverem suas habilidades em gestão de produtos e a avançarem em suas carreiras.",
    experience: [
      {
        title: "Senior Product Manager",
        company: "Google",
        period: "2020 - Presente",
        description: "Liderando o desenvolvimento de features para o Google Search"
      },
      {
        title: "Product Manager",
        company: "Amazon",
        period: "2017 - 2020",
        description: "Gerenciei produtos na área de logística e entrega"
      },
      {
        title: "Associate Product Manager",
        company: "Nubank",
        period: "2015 - 2017",
        description: "Trabalhei no desenvolvimento do app mobile"
      }
    ],
    achievements: [
      "Lançamento de produto com 5M+ usuários no primeiro ano",
      "Certificação Product Management pela Product School",
      "Speaker em conferências de Product",
      "Mentoria de 100+ profissionais"
    ]
  },
  {
    id: 2,
    name: "Carlos Santos",
    role: "Tech Lead",
    company: "Meta",
    specialty: "Software Engineering",
    rating: 4.8,
    reviews: 98,
    price: 180,
    location: "Rio de Janeiro, RJ",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    skills: ["React", "Node.js", "System Design"]
  },
  {
    id: 3,
    name: "Marina Costa",
    role: "Design Director",
    company: "Nubank",
    specialty: "UX/UI Design",
    rating: 5.0,
    reviews: 156,
    price: 220,
    location: "São Paulo, SP",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marina",
    skills: ["UI Design", "Design Systems", "Figma"]
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    role: "Engineering Manager",
    company: "Amazon",
    specialty: "Leadership",
    rating: 4.7,
    reviews: 89,
    price: 250,
    location: "Belo Horizonte, MG",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    skills: ["Team Management", "Career Growth", "Technical Leadership"]
  },
  {
    id: 5,
    name: "Julia Ferreira",
    role: "Data Science Lead",
    company: "Microsoft",
    specialty: "Data Science",
    rating: 4.9,
    reviews: 112,
    price: 210,
    location: "São Paulo, SP",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia",
    skills: ["Machine Learning", "Python", "Data Analytics"]
  },
  {
    id: 6,
    name: "Ricardo Almeida",
    role: "CTO",
    company: "Startup Tech",
    specialty: "Startup & Entrepreneurship",
    rating: 4.8,
    reviews: 74,
    price: 300,
    location: "Florianópolis, SC",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
    skills: ["Startup Strategy", "Fundraising", "Tech Stack"]
  }
];

export class MentorRepository implements IMentorRepository {
  constructor(private readonly logger: ILogger) {}

  async findAll(filters?: MentorFilters): Promise<Mentor[]> {
    this.logger.debug('Finding all mentors', filters);
    
    let mentors = [...MOCK_MENTORS];

    if (filters) {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        mentors = mentors.filter(mentor =>
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.specialty.toLowerCase().includes(searchLower) ||
          mentor.skills.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }

      if (filters.specialty) {
        mentors = mentors.filter(mentor => mentor.specialty === filters.specialty);
      }

      if (filters.location) {
        mentors = mentors.filter(mentor => mentor.location.includes(filters.location!));
      }

      if (filters.minRating !== undefined) {
        mentors = mentors.filter(mentor => mentor.rating >= filters.minRating!);
      }

      if (filters.maxPrice !== undefined) {
        mentors = mentors.filter(mentor => mentor.price <= filters.maxPrice!);
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return mentors;
  }

  async findById(id: number): Promise<Mentor | null> {
    this.logger.debug('Finding mentor by id', { id });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const mentor = MOCK_MENTORS.find(m => m.id === id);
    
    if (!mentor) {
      throw new NotFoundError('Mentor', id);
    }

    return mentor;
  }

  async search(query: string): Promise<Mentor[]> {
    this.logger.debug('Searching mentors', { query });
    return this.findAll({ searchTerm: query });
  }
}

