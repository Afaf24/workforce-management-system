# Use the official Microsoft .NET SDK image to build the project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution and projects to restore dependencies
COPY ["HRSystem.API/HRSystem.API.csproj", "HRSystem.API/"]
COPY ["HRSystem.Application/HRSystem.Application.csproj", "HRSystem.Application/"]
COPY ["HRSystem.Domain/HRSystem.Domain.csproj", "HRSystem.Domain/"]
COPY ["HRSystem.Infrastructure/HRSystem.Infrastructure.csproj", "HRSystem.Infrastructure/"]

RUN dotnet restore "HRSystem.API/HRSystem.API.csproj"

# Copy the rest of the source files and build the app
COPY . .
WORKDIR "/src/HRSystem.API"
RUN dotnet build "HRSystem.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "HRSystem.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Generate runtime image using ASP.NET base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "HRSystem.API.dll"]