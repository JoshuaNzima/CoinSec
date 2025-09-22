import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Clock, 
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { mockIncidents, type Incident } from '../data/mock-data';

export function IncidentReporting() {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: '',
    category: '',
    location: ''
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would submit to API
    console.log('Submitting incident:', formData);
    // Reset form
    setFormData({
      title: '',
      description: '',
      severity: '',
      category: '',
      location: ''
    });
    // Show success message
    alert('Incident reported successfully!');
  };

  const incidentCategories = [
    'Security Breach',
    'Medical Emergency',
    'Equipment Failure',
    'Safety Hazard',
    'Theft/Vandalism',
    'Fire/Evacuation',
    'Suspicious Activity',
    'Vehicle Incident',
    'Other'
  ];

  return (
    <div className="space-y-4">
      {/* Header with Tab Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Incident Reporting</h2>
          <p className="text-sm text-muted-foreground">
            Report and track security incidents
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'report' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('report')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            <FileText className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {activeTab === 'report' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Report New Incident
            </CardTitle>
            <CardDescription>
              Fill out the form below to report a security incident
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Incident Title</label>
                  <Input 
                    placeholder="Brief description of the incident"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    placeholder="Specific location or area"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Severity Level</label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Detailed Description</label>
                <Textarea 
                  placeholder="Provide a detailed description of what happened, when it occurred, and any other relevant information..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              {/* Photo and Evidence Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Evidence & Documentation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" type="button" className="h-24 flex-col">
                    <Camera className="h-6 w-6 mb-2" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                  <Button variant="outline" type="button" className="h-24 flex-col">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span className="text-sm">Mark Location</span>
                  </Button>
                  <Button variant="outline" type="button" className="h-24 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Attach File</span>
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search incidents..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Incident List */}
          <div className="space-y-3">
            {mockIncidents.map((incident) => (
              <Card key={incident.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedIncident(incident)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        incident.severity === 'critical' ? 'bg-red-100' :
                        incident.severity === 'high' ? 'bg-orange-100' :
                        incident.severity === 'medium' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          incident.severity === 'critical' ? 'text-red-600' :
                          incident.severity === 'high' ? 'text-orange-600' :
                          incident.severity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {incident.site} • {incident.location} • {incident.reportedBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(incident.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
             onClick={() => setSelectedIncident(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Incident Details
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedIncident(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedIncident.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                  <Badge className={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Badge>
                  <Badge variant="outline">{selectedIncident.category}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p className="font-medium">{selectedIncident.reportedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {new Date(selectedIncident.reportedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedIncident.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Site</p>
                  <p className="font-medium">{selectedIncident.site}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-muted p-3 rounded">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="flex gap-3">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Evidence
                </Button>
                <Button size="sm" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  View Location
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open Incidents</p>
                <p className="text-xl font-semibold">
                  {mockIncidents.filter(i => i.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-xl font-semibold">
                  {mockIncidents.filter(i => i.status === 'investigating').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-semibold">
                  {mockIncidents.filter(i => i.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total This Week</p>
                <p className="text-xl font-semibold">{mockIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}