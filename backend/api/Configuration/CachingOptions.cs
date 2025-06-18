namespace api.Configuration
{
    public class CachingOptions
    {
        public const string SectionName = "Caching";

        public TimeSpan DefaultExpiration { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan ReviewsExpiration { get; set; } = TimeSpan.FromMinutes(5);
        public TimeSpan RatingsExpiration { get; set; } = TimeSpan.FromMinutes(10);
        public int MemoryCacheSize { get; set; } = 1000;
        public bool EnableResponseCaching { get; set; } = true;
    }
}
