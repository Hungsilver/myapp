# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder
WORKDIR /src
COPY MyApp.Api/*.csproj ./MyApp.Api/
RUN dotnet restore ./MyApp.Api/MyApp.Api.csproj
COPY MyApp.Api/ ./MyApp.Api/
RUN dotnet publish ./MyApp.Api/MyApp.Api.csproj -c Release -o /publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=builder /publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
