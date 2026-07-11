using FluentValidation.Results;

namespace HRSystem.Application.Common.Exceptions;

/// <summary>
/// Thrown by the ValidationBehavior pipeline when a request fails FluentValidation rules.
/// Caught by the global exception middleware and translated to HTTP 400.
/// </summary>
public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException() : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures) : this()
    {
        Errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
    }
}
