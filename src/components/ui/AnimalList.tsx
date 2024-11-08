import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from './pagination';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface Animal {
  id: number;
  nombre: string;
  tipo: string;
  edad: string;
  estado: string;
  genero: string;
  desc_fisica: string;
  desc_personalidad: string;
  desc_adicional: string;
  esterilizado: number;
  vacunas: number;
  imagen: string;
  equipo: string;
  region: string;
  comuna: string;
  url: string;
}

interface ApiResponse {
  data: Animal[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

const allRegions = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "RM", "O'Higgins", "Maule", "Ñuble", "Biobío",
  "La Araucanía", "Los Ríos", "Los Lagos", "Aisén",
  "Magallanes y Antártica Chilena"
];

const ITEMS_PER_PAGE = 20;

export default function AnimalList() {
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchAllAnimals();
  }, []);

  const fetchAllAnimals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://huachitos.cl/api/animales?per_page=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      const data: ApiResponse = await response.json();
      setAllAnimals(data.data);
    } catch (err) {
      setError('Error fetching animals. Please try again later.');
      console.error('Error fetching animals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnimals = useMemo(() => {
    return selectedRegion === 'all'
      ? allAnimals
      : allAnimals.filter(animal => animal.region === selectedRegion);
  }, [allAnimals, selectedRegion]);

  const availableRegions = useMemo(() => {
    const regions = new Set(allAnimals.map(animal => animal.region));
    return allRegions.filter(region => regions.has(region));
  }, [allAnimals]);

  const totalPages = Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE);

  const currentAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnimals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAnimals, currentPage]);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Animales en Adopción</h1>
      <div className="mb-4">
        <Select onValueChange={handleRegionChange} value={selectedRegion}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecciona una región" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las regiones</SelectItem>
            {availableRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAnimals.map((animal) => (
          <Card key={animal.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{animal.nombre}</CardTitle>
              <CardDescription>{animal.tipo} - {animal.edad}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <Avatar className="w-full h-48 rounded-lg mb-4">
                <AvatarImage src={animal.imagen} alt={animal.nombre} className="object-cover" />
                <AvatarFallback>{animal.nombre[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Badge variant={animal.estado === 'adopcion' ? 'default' : 'secondary'}>
                  {animal.estado}
                </Badge>
                <Badge variant="outline">{animal.genero}</Badge>
                <div dangerouslySetInnerHTML={{ __html: animal.desc_fisica }} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.open(animal.url, '_blank')}>
                Más información
              </Button>
              <div className="text-sm text-muted-foreground">
                {animal.region}, {animal.comuna}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}