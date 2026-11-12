using Microsoft.EntityFrameworkCore;
using backend.Entities;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace backend.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Member> Members { get; set; }
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Likes> Likes { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.ClrType.GetProperties()
                .Where(p => p.PropertyType == typeof(DateTime) || p.PropertyType == typeof(DateTime?));

            foreach (var property in properties)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(property.Name)
                    .HasConversion(dateTimeConverter);
            }
        }

        modelBuilder.Entity<Likes>(entity =>
        {
            entity.HasKey(like => new { like.SourceMemberId, like.TargetedMemberId });

            entity.HasOne(like => like.SourceMember)
                .WithMany(member => member.LikedMembers)
                .HasForeignKey(like => like.SourceMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(like => like.TargetedMember)
                .WithMany(member => member.LikedByMembers)
                .HasForeignKey(like => like.TargetedMemberId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.Property(message => message.Content).HasMaxLength(4000);

            entity.HasOne<Member>()
                .WithMany()
                .HasForeignKey(message => message.SenderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne<Member>()
                .WithMany()
                .HasForeignKey(message => message.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(message => new { message.SenderId, message.RecipientId, message.SentAt });
            entity.HasIndex(message => new { message.RecipientId, message.SenderId, message.SentAt });
        });
    }
}
