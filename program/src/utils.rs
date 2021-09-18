use std::str::from_utf8;

// decode bytes data into utf-8 string
pub fn convert_u8bytes_to_string(bytes: &[u8]) -> String {
    bytes
        .chunks(4)
        .map(|slice| {
            let end = if slice[3] > 0 {
                3
            } else if slice[2] > 0 {
                2
            } else if slice[1] > 0 {
                1
            } else {
                0
            };

            from_utf8(&slice[0..=end]).unwrap().to_string()
        })
        .collect()
}
