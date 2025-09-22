import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { DatePickerWithRange } from './ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckSquare,
  FileText,
  Clock,
  Star,
  Download,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'incident' | 'checkpoint' | 'report' | 'communication' | 'equipment';
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  priority?: string;
  tags: string[];
  relevance: number;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'incident',
    title: 'Suspicious Activity Report',
    description: 'Individual loitering near main entrance, approached and questioned',
    date: '2024-12-19T14:30:00Z',
    location: 'Main Entrance',
    status: 'resolved',
    priority: 'medium',
    tags: ['security', 'suspicious activity', 'resolved'],
    relevance: 95
  },
  {
    id: '2',
    type: 'checkpoint',
    title: 'Loading Dock Checkpoint',
    description: 'Routine security check of loading dock area',
    date: '2024-12-19T13:15:00Z',
    location: 'Loading Dock B',
    status: 'completed',
    tags: ['routine', 'loading dock', 'completed'],
    relevance: 87
  },
  {
    id: '3',
    type: 'equipment',
    title: 'Radio Equipment Check',
    description: 'Battery level check and functionality test',
    date: '2024-12-19T12:00:00Z',
    location: 'Security Office',
    status: 'maintenance required',
    tags: ['equipment', 'radio', 'maintenance'],
    relevance: 82
  },
  {
    id: '4',
    type: 'report',
    title: 'Daily Activity Summary',
    description: 'Summary of all activities during morning shift',
    date: '2024-12-19T08:00:00Z',
    location: 'Multiple Locations',
    status: 'submitted',
    tags: ['daily report', 'summary', 'morning shift'],
    relevance: 76
  }
];

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter results based on search query and filters
    let filteredResults = mockSearchResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply additional filters
    if (activeFilters.type) {
      filteredResults = filteredResults.filter(result => result.type === activeFilters.type);
    }
    if (activeFilters.status) {
      filteredResults = filteredResults.filter(result => result.status === activeFilters.status);
    }
    if (activeFilters.priority) {
      filteredResults = filteredResults.filter(result => result.priority === activeFilters.priority);
    }
    if (activeFilters.location) {
      filteredResults = filteredResults.filter(result => 
        result.location.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Sort by relevance
    filteredResults.sort((a, b) => b.relevance - a.relevance);
    
    setSearchResults(filteredResults);
    setIsSearching(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checkpoint': return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'report': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'communication': return <User className="h-4 w-4 text-purple-500" />;
      case 'equipment': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'resolved':
      case 'submitted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'maintenance required':
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const clearFilter = (filterKey: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const exportResults = () => {
    const csvContent = searchResults.map(result => 
      [result.type, result.title, result.description, result.date, result.location, result.status].join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <CardDescription>
            Search across all your security data with advanced filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents, checkpoints, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('incident')}
            >
              Recent Incidents
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('today')}
            >
              Today's Activity
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('equipment')}
            >
              Equipment Issues
            </Button>
          </div>

          {/* Active Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Filters:</span>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {key}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => clearFilter(key)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
            <CardDescription>
              Refine your search with specific criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={activeFilters.type || ''}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident">Incidents</SelectItem>
                    <SelectItem value="checkpoint">Checkpoints</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="communication">Communications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={activeFilters.status || ''}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={activeFilters.priority || ''}
                  onValueChange={(value) => setActiveFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Filter by location"
                  value={activeFilters.location || ''}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {searchResults.length} results for "{searchQuery}"
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {searchResults.map((result) => (
              <div key={result.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{result.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.priority && (
                          <Badge
                            variant={result.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {result.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {result.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {result.relevance}% match
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}