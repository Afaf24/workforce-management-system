using FluentValidation;
using HRSystem.Application.DTOs.Auth;
using HRSystem.Application.DTOs.Employee;
using HRSystem.Application.DTOs.Leave;
using HRSystem.Application.DTOs.Attendance;
using HRSystem.Application.DTOs.Department;

namespace HRSystem.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateEmployeeRequestValidator : AbstractValidator<CreateEmployeeRequestDto>
{
    public CreateEmployeeRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long.");
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.JobTitle).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.HireDate).NotEmpty().LessThanOrEqualTo(DateTime.UtcNow.AddDays(1));
        RuleFor(x => x.Role).NotEmpty()
            .Must(r => new[] { "HRManager", "DepartmentManager", "Employee" }.Contains(r))
            .WithMessage("Role must be one of: HRManager, DepartmentManager, Employee.");
        RuleFor(x => x.Salary).GreaterThanOrEqualTo(0).When(x => x.Salary.HasValue);
    }
}

public class UpdateEmployeeRequestValidator : AbstractValidator<UpdateEmployeeRequestDto>
{
    public UpdateEmployeeRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.JobTitle).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Salary).GreaterThanOrEqualTo(0).When(x => x.Salary.HasValue);
    }
}

public class CreateLeaveRequestValidator : AbstractValidator<CreateLeaveRequestDto>
{
    public CreateLeaveRequestValidator()
    {
        RuleFor(x => x.LeaveType).NotEmpty()
            .Must(t => new[] { "Annual", "Sick", "Unpaid", "Maternity", "Paternity", "Other" }.Contains(t))
            .WithMessage("Invalid leave type.");
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End date must be on or after the start date.");
        RuleFor(x => x.Reason).MaximumLength(500);
    }
}

public class ReviewLeaveRequestValidator : AbstractValidator<ReviewLeaveRequestDto>
{
    public ReviewLeaveRequestValidator()
    {
        RuleFor(x => x.Comment).MaximumLength(500);
    }
}

public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequestDto>
{
    public CreateDepartmentRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}

public class ClockInRequestValidator : AbstractValidator<ClockInRequestDto>
{
    public ClockInRequestValidator()
    {
        RuleFor(x => x.Notes).MaximumLength(300);
    }
}
