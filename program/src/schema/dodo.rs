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
    pub content: String,
    pub state: u8,
    pub create_time: u32,
    pub update_time: u32,
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
    const LEN: usize = 140 * 4 + // title 140 chars
                       500 * 4 + // content 500 chars
                       1 + // state 1byte (0,1,2)
                       4 + // create_time 4bytes (timestamp)
                       4; // update_time 4bytes (timestamp)

    // Unpack data from [u8] to the data struct
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, 140 * 4 + 500 * 4 + 1 + 4 + 4];
        let (title, content, state, create_time, update_time) =
            array_refs![src, 140 * 4, 500 * 4, 1, 4, 4];

        let title_s: String = title
            .chunks(4)
            .map(|slice| String::from_utf8([slice[0]].to_vec()).unwrap())
            .collect();

        let content_s: String = content
            .chunks(4)
            .map(|slice| String::from_utf8([slice[0]].to_vec()).unwrap())
            .collect();

        let state_u = u8::from_le_bytes(*state);
        let create_time_u = u32::from_le_bytes(*create_time);
        let update_time_u = u32::from_le_bytes(*update_time);

        Ok(Dodo {
            title: title_s,
            content: content_s,
            state: state_u,
            create_time: create_time_u,
            update_time: update_time_u,
        })
    }

    // Pack data from the data struct to [u8]
    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, 140 * 4 + 500 * 4 + 1 + 4 + 4];
        let (dst_title, dst_content, dst_state, dst_create_time, dst_update_time) =
            mut_array_refs![dst, 140 * 4, 500 * 4, 1, 4, 4];

        // Destructure a reference of self to get data to be packed
        let Dodo {
            title,
            content,
            state,
            create_time,
            update_time,
        } = self;

        pack_string_140_chars(&title, dst_title);
        pack_string_500_chars(&content, dst_content);

        *dst_state = state.to_le_bytes();
        *dst_create_time = create_time.to_le_bytes();
        *dst_update_time = update_time.to_le_bytes();
    }
}

fn pack_string_140_chars(src: &String, dst: &mut [u8; 140 * 4]) {
    // utf8 strings no unicode no special things, only this
    let mut index = 0;
    for c in src.chars() {
        dst[index] = c.to_string().as_bytes()[0];
        // 4 in 4 because utf8 normal character takes only 1 byte
        index += 4;
    }
}

fn pack_string_500_chars(src: &String, dst: &mut [u8; 500 * 4]) {
    let mut index = 0;
    for c in src.chars() {
        dst[index] = c.to_string().as_bytes()[0];
        index += 4;
    }
}
