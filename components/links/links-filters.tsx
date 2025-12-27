'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LinksFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  tags: string[];
}

export const LinksFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  tagFilter,
  onTagFilterChange,
  tags,
}: LinksFiltersProps) => {
  return (
    <div className='flex flex-col sm:flex-row gap-4'>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search links...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-9'
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className='w-full sm:w-[180px]'>
          <Filter className='h-4 w-4 mr-2' />
          <SelectValue placeholder='All Statuses' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='warning'>Warning</SelectItem>
          <SelectItem value='broken'>Broken</SelectItem>
          <SelectItem value='checking'>checking</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className='w-full sm:w-[180px]'>
          <Filter className='h-4 w-4 mr-2' />
          <SelectValue placeholder='All Categories' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tagFilter} onValueChange={onTagFilterChange}>
        <SelectTrigger className='w-full sm:w-[180px]'>
          <Filter className='h-4 w-4 mr-2' />
          <SelectValue placeholder='All Tags' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
