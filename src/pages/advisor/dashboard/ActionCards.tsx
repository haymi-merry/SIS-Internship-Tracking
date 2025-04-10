import { Grid, Card, CardContent, Typography, Avatar, Stack, Badge } from '@mui/material';
import { 
  Assignment as PendingIcon,
  Description as ReportsIcon,
  People as StudentsIcon
} from '@mui/icons-material';

interface ActionCardsProps {
  pendingApprovals: number;
  reportsToReview: number;
  ongoingStudents: number;
  onPendingApprovalsClick: () => void;
  onReportsToReviewClick: () => void;
  onOngoingStudentsClick: () => void;
}

export const ActionCards = ({ 
  pendingApprovals, 
  reportsToReview, 
  ongoingStudents,
  onPendingApprovalsClick,
  onReportsToReviewClick,
  onOngoingStudentsClick
}: ActionCardsProps) => {
  const actions = [
    {
      title: "Pending Approvals",
      count: pendingApprovals,
      icon: <PendingIcon />,
      color: "warning",
      onClick: onPendingApprovalsClick,
      showBadge: pendingApprovals > 0,
      description: pendingApprovals === 1 ? "1 unapproved offer letter" : `${pendingApprovals} unapproved offer letters`
    },
    {
      title: "Reports to Review",
      count: reportsToReview,
      icon: <ReportsIcon />,
      color: "info",
      onClick: onReportsToReviewClick,
      showBadge: reportsToReview > 0,
      description: reportsToReview === 1 ? "1 report awaiting review" : `${reportsToReview} reports awaiting review`
    },
    {
      title: "Ongoing Students",
      count: ongoingStudents,
      icon: <StudentsIcon />,
      color: "success",
      onClick: onOngoingStudentsClick,
      description: ongoingStudents === 1 ? "1 active internship" : `${ongoingStudents} active internships`
    }
  ];

  return (
    <Grid container spacing={3}>
      {actions.map((action) => (
        <Grid item xs={12} sm={6} md={4} key={action.title}>
          <Card 
            onClick={action.onClick}
            sx={{ 
              cursor: 'pointer',
              height: '100%',
              '&:hover': { 
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Badge 
                  color="error" 
                  badgeContent={action.showBadge ? "!" : 0}
                  invisible={!action.showBadge}
                  overlap="circular"
                >
                  <Avatar sx={{ 
                    bgcolor: `${action.color}.light`, 
                    color: `${action.color}.dark`,
                    width: 56, 
                    height: 56
                  }}>
                    {action.icon}
                  </Avatar>
                </Badge>
                <div>
                  <Typography variant="subtitle1" fontWeight="medium">{action.title}</Typography>
                  <Typography variant="h4" fontWeight="bold">{action.count}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};