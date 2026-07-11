namespace HRSystem.Domain.Exceptions;

/// <summary>Thrown when a requested entity cannot be found.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" with key ({key}) was not found.") { }

    public NotFoundException(string message) : base(message) { }
}

/// <summary>Thrown when a business rule is violated.</summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}

/// <summary>Thrown when a user attempts an action they are not authorized to perform.</summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("You do not have permission to perform this action.") { }
    public ForbiddenAccessException(string message) : base(message) { }
}
