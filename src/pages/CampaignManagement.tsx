import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignFilters } from "@/components/campaign/CampaignFilters";
import { CampaignTable } from "@/components/campaign/CampaignTable";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCampaignStore } from "@/stores/useCampaignStore";
import { Campaign } from "@/stores/types/campaign";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampaignManagement() {
  const {
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    getCampaignStatus,
  } = useCampaignStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | undefined>();

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'all') {
        return matchesSearch;
      }
      
      const status = getCampaignStatus(campaign);
      const matchesStatus = status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter, getCampaignStatus]);

  // Statistics
  const stats = useMemo(() => {
    const active = campaigns.filter((c) => getCampaignStatus(c) === 'active' && c.isActive).length;
    const upcoming = campaigns.filter((c) => getCampaignStatus(c) === 'upcoming').length;
    const total = campaigns.length;
    
    return { active, upcoming, total };
  }, [campaigns, getCampaignStatus]);

  const handleCreateCampaign = () => {
    setEditingCampaign(undefined);
    setIsFormOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormOpen(true);
  };

  const handleSaveCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCampaign) {
        updateCampaign(editingCampaign.id, campaignData);
        toast.success('Cập nhật campaign thành công');
      } else {
        addCampaign(campaignData);
        toast.success('Tạo campaign mới thành công');
      }
      setIsFormOpen(false);
      setEditingCampaign(undefined);
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const handleDeleteCampaign = (id: string) => {
    try {
      deleteCampaign(id);
      toast.success('Xóa campaign thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const handleToggleStatus = (id: string) => {
    try {
      toggleCampaignStatus(id);
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingCampaign(undefined);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý các chiến dịch giảm giá tự động
          </p>
        </div>
        <Button onClick={handleCreateCampaign} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Tạo Campaign
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Đang hoạt động</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Campaign đang chạy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sắp diễn ra</CardDescription>
            <CardTitle className="text-3xl">{stats.upcoming}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Campaign chưa bắt đầu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tổng số</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tất cả campaign
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CampaignFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        onEdit={handleEditCampaign}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteCampaign}
        getStatus={getCampaignStatus}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CampaignForm
            campaign={editingCampaign}
            onSave={handleSaveCampaign}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
