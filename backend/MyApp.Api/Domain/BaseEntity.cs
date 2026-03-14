using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Domain
{
    public abstract class BaseEntity
    {
        private List<string> _dirtyProperties { get; set; } = new List<string>();

        public BaseEntity MarkDirty(string fieldName)
        {
            this._dirtyProperties.Add(fieldName);
            return this;
        }
        public BaseEntity ClearMarkDirty()
        {
            this._dirtyProperties = new List<string>();
            return this;
        }

        public BaseEntity MarkDirty(List<string> fieldName)
        {
            foreach (var item in fieldName)
            {
                if (!_dirtyProperties.Contains(item))
                {
                    this._dirtyProperties.Add(item);
                }
            }
            return this;
        }


        public List<string> GetDirtyProperties()
        {
            return _dirtyProperties;
        }
        /// <summary>
        /// Gets or sets the entity identifier
        /// </summary>
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public Guid Id { get; set; }
        public bool IsDelete { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(60)]
        public string? CreatedUserName { get; set; }
        [StringLength(60)]
        public string? UpdatedUserName { get; set; }
    }
}
