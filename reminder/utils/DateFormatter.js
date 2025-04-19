function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.replace(/(\d+)-(\d+)-(\d+)/, '$1-$2-$3');
}
