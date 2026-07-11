using HRSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRSystem.Infrastructure.Persistence.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.ToTable("Attendances");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(a => a.WorkedHours).HasColumnType("numeric(5,2)");
        builder.Property(a => a.Notes).HasMaxLength(300);

        builder.HasIndex(a => new { a.EmployeeId, a.Date }).IsUnique();

        builder.HasOne(a => a.Employee)
            .WithMany(e => e.AttendanceRecords)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.ToTable("LeaveRequests");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.LeaveType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(l => l.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(l => l.TotalDays).HasColumnType("numeric(5,1)");
        builder.Property(l => l.Reason).HasMaxLength(500);
        builder.Property(l => l.ReviewComment).HasMaxLength(500);

        builder.HasOne(l => l.Employee)
            .WithMany(e => e.LeaveRequests)
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.ReviewedBy)
            .WithMany()
            .HasForeignKey(l => l.ReviewedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
{
    public void Configure(EntityTypeBuilder<LeaveBalance> builder)
    {
        builder.ToTable("LeaveBalances");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.LeaveType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(l => l.TotalAllotted).HasColumnType("numeric(5,1)");
        builder.Property(l => l.Used).HasColumnType("numeric(5,1)");
        builder.Property(l => l.Remaining).HasColumnType("numeric(5,1)");

        builder.HasIndex(l => new { l.EmployeeId, l.LeaveType, l.Year }).IsUnique();

        builder.HasOne(l => l.Employee)
            .WithMany(e => e.LeaveBalances)
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AIConversationConfiguration : IEntityTypeConfiguration<AIConversation>
{
    public void Configure(EntityTypeBuilder<AIConversation> builder)
    {
        builder.ToTable("AIConversations");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Question).IsRequired();
        builder.Property(a => a.Answer).IsRequired();

        builder.HasOne(a => a.Employee)
            .WithMany()
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
