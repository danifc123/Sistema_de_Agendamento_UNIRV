# Use a imagem base do .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Limpar o cache do NuGet
RUN dotnet nuget locals all --clear

# Copiar arquivos de projeto e restaurar dependências
COPY ["API.csproj", "./"]
RUN dotnet restore "./API.csproj"

# Copiar todo o código fonte
COPY . .

# Build da aplicação
RUN dotnet build "API.csproj" -c Release -o /app/build

# Publicar a aplicação
FROM build AS publish
RUN dotnet publish "API.csproj" -c Release -o /app/publish

# Imagem final
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expor a porta
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["dotnet", "API.dll", "--urls=http://0.0.0.0:8080"]
