import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { incidentService, Incident } from '@guard-services/shared';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      // Fallback to mock data
      setIncidents(mockIncidents);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Incident['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.reporter_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIncidentsByStatus = (status: Incident['status']) => {
    return filteredIncidents.filter(incident => incident.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = [
    {
      title: 'Total Incidents',
      value: incidents.length,
      icon: AlertTriangle,
      color: 'text-blue-600'
    },
    {
      title: 'Open',
      value: incidents.filter(i => i.status === 'open').length,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'In Progress',
      value: incidents.filter(i => i.status === 'in_progress').length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Resolved',
      value: incidents.filter(i => i.status === 'resolved').length,
      icon: AlertTriangle,
      color: 'text-green-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incident Management</h1>
          <p className="text-muted-foreground">
            Monitor, track, and resolve security incidents across all sites.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
              <DialogDescription>
                Create a new incident report with detailed information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Incident reporting form would be implemented here with proper form validation and file upload capabilities.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Incidents</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <IncidentTable
            incidents={filteredIncidents}
            loading={loading}
            onSelectIncident={setSelectedIncident}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="open">
          <IncidentTable
            incidents={getIncidentsByStatus('open')}
            loading={loading}
            onSelectIncident={setSelectedIncident}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="in_progress">
          <IncidentTable
            incidents={getIncidentsByStatus('in_progress')}
            loading={loading}
            onSelectIncident={setSelectedIncident}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <IncidentTable
            incidents={getIncidentsByStatus('resolved')}
            loading={loading}
            onSelectIncident={setSelectedIncident}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-3xl">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {selectedIncident.title}
                </DialogTitle>
                <DialogDescription>
                  Incident ID: {selectedIncident.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Badge className={getPriorityColor(selectedIncident.priority)}>
                      {selectedIncident.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedIncident.status)}>
                      {selectedIncident.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reporter</Label>
                    <p className="text-sm">{selectedIncident.reporter_name}</p>
                  </div>
                  <div>
                    <Label>Reported</Label>
                    <p className="text-sm">{formatDate(selectedIncident.created_at)}</p>
                  </div>
                </div>

                {selectedIncident.location && (
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm">
                      {selectedIncident.location.latitude}, {selectedIncident.location.longitude}
                      {selectedIncident.location.address && ` - ${selectedIncident.location.address}`}
                    </p>
                  </div>
                )}

                {selectedIncident.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm text-muted-foreground">{selectedIncident.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component for incident table
interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
  onSelectIncident: (incident: Incident) => void;
  getPriorityColor: (priority: Incident['priority']) => string;
  getStatusColor: (status: Incident['status']) => string;
  formatDate: (date: string) => string;
}

function IncidentTable({ 
  incidents, 
  loading, 
  onSelectIncident, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}: IncidentTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No incidents found
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{incident.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {incident.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {incident.reporter_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(incident.priority)}>
                      {incident.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(incident.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectIncident(incident)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Add Label component if not available
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium mb-1">{children}</div>;
}

// Mock data for fallback
const mockIncidents: Incident[] = [
  {
    id: '1',
    reporter_id: 'user-1',
    reporter_name: 'John Doe',
    title: 'Suspicious Activity',
    description: 'Unidentified person attempting to access restricted area',
    type: 'security',
    priority: 'high',
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    reporter_id: 'user-2',
    reporter_name: 'Jane Smith',
    title: 'Equipment Malfunction',
    description: 'Security camera in lobby is not functioning properly',
    type: 'other',
    priority: 'medium',
    status: 'in_progress',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    reporter_id: 'user-3',
    reporter_name: 'Mike Johnson',
    title: 'Medical Emergency',
    description: 'Visitor collapsed in main lobby, ambulance called',
    type: 'medical',
    priority: 'critical',
    status: 'resolved',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];