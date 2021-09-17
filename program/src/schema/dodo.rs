use std::str::from_utf8;

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};

//
// Define the data struct
//
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Dodo {
    pub title: String,
    pub tagline: String,
    pub state: u8,
    pub create_time: u64,
    pub update_time: u64,
    pub creator: [u8; 32],
}

//
// Implement Sealed trait
//
impl Sealed for Dodo {}

//
// Implement IsInitialized trait
//
impl IsInitialized for Dodo {
    fn is_initialized(&self) -> bool {
        true
    }
}

//
// Implement Pack trait
//
impl Pack for Dodo {
    // Fixed length
    const LEN: usize = 124 * 4 + // title 124 chars
                       24 * 4 + // tagline 24 chars
                       1 + // state 1byte (0,1,2)
                       8 + // create_time 4bytes (timestamp)
                       8 + // update_time 4bytes (timestamp)
                       1 * 32; // creator 32 bytes

    // Unpack data from [u8] to the data struct
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, 124 * 4 + 24 * 4 + 1 + 8 + 8 + 1 * 32];
        let (title, tagline, state, create_time, update_time, creator) =
            array_refs![src, 124 * 4, 24 * 4, 1, 8, 8, 1 * 32];

        let title_s: String = title
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
            .collect();

        let tagline_s: String = tagline
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
            .collect();

        let state_u = u8::from_le_bytes(*state);
        let create_time_u = u64::from_le_bytes(*create_time);
        let update_time_u = u64::from_le_bytes(*update_time);

        Ok(Dodo {
            title: title_s,
            tagline: tagline_s,
            state: state_u,
            create_time: create_time_u,
            update_time: update_time_u,
            creator: *creator,
        })
    }

    // Pack data from the data struct to [u8]
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, 124 * 4 + 24 * 4 + 1 + 8 + 8 + 1 * 32];
        let (dst_title, dst_tagline, dst_state, dst_create_time, dst_update_time, dst_creator) =
            mut_array_refs![dst, 124 * 4, 24 * 4, 1, 8, 8, 1 * 32];

        // Destructure a reference of self to get data to be packed
        let Dodo {
            title,
            tagline,
            state,
            create_time,
            update_time,
            creator,
        } = self;

        pack_string_124_chars(&title, dst_title);
        pack_string_24_chars(&tagline, dst_tagline);

        *dst_state = state.to_le_bytes();
        *dst_create_time = create_time.to_le_bytes();
        *dst_update_time = update_time.to_le_bytes();
        *dst_creator = *creator;
    }
}

fn pack_string_124_chars(src: &String, dst: &mut [u8; 124 * 4]) {
    let mut index = 0;
    for c in src.chars() {
        let char_str = c.to_string();
        let char_bytes = char_str.as_bytes();

        for i in 0..char_bytes.len() {
            dst[index + i] = char_bytes[i];
        }

        index += 4;
    }
}

fn pack_string_24_chars(src: &String, dst: &mut [u8; 24 * 4]) {
    let mut index = 0;
    for c in src.chars() {
        let char_str = c.to_string();
        let char_bytes = char_str.as_bytes();

        for i in 0..char_bytes.len() {
            dst[index + i] = char_bytes[i];
        }

        index += 4;
    }
}
